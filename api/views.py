from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import TrackSerializer, TimeSerializer, UserSerializer
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from .models import Industry, IndustryKeyword, Stock, Time, Track, Nation, ForeignKeyword
import re
import json
import requests
import pandas as pd
import datetime
import urllib.request as req
import urllib.error
import jieba
import yfinance as yf
import time

# 記憶體快取，降低爬蟲延遲與被封鎖風險
_TRENDS_CACHE = {"timestamp": 0, "keywords": [], "dataTitle": [], "dataArticles": []}
_KEYWORD_WORDS_CACHE = {}  # {keyword: {"words": [...], "timestamp": float}}
CACHE_TTL_SECONDS = 300  # 快取 5 分鐘

@api_view(['POST'])
def register_user(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': '請提供使用者名稱與密碼'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': '該使用者名稱已被使用'}, status=status.HTTP_400_BAD_REQUEST)

    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        return token

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

@api_view(['GET'])
def apiOverview(request):
    api_urls = {
        'Token': '/api/token/',
        'Refresh': '/api/token/refresh/',
        'keywordList': '/api/keyword-list/',
        'nationList': '/api/nation-list/',
        'categoryList': '/api/category-list/',
        'stockChart': '/api/stock-chart/',
        'trackList': '/api/track-list/',
    }
    return Response(api_urls)

def _get_google_trends():
    global _TRENDS_CACHE
    now = time.time()
    if now - _TRENDS_CACHE["timestamp"] < CACHE_TTL_SECONDS and _TRENDS_CACHE["keywords"]:
        return _TRENDS_CACHE["keywords"], _TRENDS_CACHE["dataTitle"], _TRENDS_CACHE["dataArticles"]

    header = {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    }
    enddt = datetime.datetime.today()
    startdt = enddt - datetime.timedelta(days=1)
    df_list = []

    for i in pd.date_range(start=startdt.strftime('%Y%m%d'), end=enddt.strftime('%Y%m%d'), freq='1D'):
        url = f'https://trends.google.com.tw/trends/api/dailytrends?hl=zh-TW&tz=-480&ed={i.strftime("%Y%m%d")}&geo=TW&ns=15'
        try:
            resp = requests.get(url, headers=header, timeout=6)
            if resp.status_code == 200:
                raw_json = re.sub(r'^\)\]\}\',\n', '', resp.text)
                parsed = json.loads(raw_json)
                days_data = parsed.get('default', {}).get('trendingSearchesDays', [])
                if days_data:
                    ndf = pd.DataFrame(days_data[0].get('trendingSearches', []))
                    if not ndf.empty:
                        ndf['date'] = i.strftime('%Y-%m-%d')
                        df_list.append(ndf)
        except Exception as e:
            print(f"爬取 Google Trends 發生異常: {e}")

    if df_list:
        combined_df = pd.concat(df_list, ignore_index=True)
        if 'title' in combined_df.columns:
            combined_df['title'] = combined_df['title'].apply(lambda x: x.get('query', '') if isinstance(x, dict) else str(x))
            keywords = [{"value": row['title'], "label": row['title']} for _, row in combined_df.iterrows() if row['title']]
            dataTitle = list(combined_df['title'].head(40))
            dataArticles = list(combined_df['articles'].head(40)) if 'articles' in combined_df.columns else []

            _TRENDS_CACHE = {
                "timestamp": now,
                "keywords": keywords,
                "dataTitle": dataTitle,
                "dataArticles": dataArticles,
            }
            return keywords, dataTitle, dataArticles

    return _TRENDS_CACHE["keywords"], _TRENDS_CACHE["dataTitle"], _TRENDS_CACHE["dataArticles"]

@api_view(['GET'])
def keywordList(request):
    keywords, _, _ = _get_google_trends()
    return Response(keywords)

def crawlerKeyword(request):
    keyword = request.query_params.get('keyword', '').strip()
    if not keyword:
        return []

    now = time.time()
    if keyword in _KEYWORD_WORDS_CACHE:
        cache_item = _KEYWORD_WORDS_CACHE[keyword]
        if now - cache_item["timestamp"] < CACHE_TTL_SECONDS:
            return cache_item["words"]

    _, dataTitle, dataArticles = _get_google_trends()

    header = {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    }

    dataStr = ""
    for idx, title in enumerate(dataTitle):
        if keyword == title and idx < len(dataArticles):
            articles = dataArticles[idx] if isinstance(dataArticles[idx], list) else []
            for j in range(min(3, len(articles))):
                article_url = articles[j].get("url") if isinstance(articles[j], dict) else None
                if not article_url:
                    continue
                try:
                    req_obj = req.Request(article_url, headers=header)
                    with req.urlopen(req_obj, timeout=4) as response:
                        html_content = response.read().decode("utf-8", errors="ignore")
                    dataStr += html_content
                except Exception as e:
                    print(f"無法爬取新聞內文 [{article_url}]: {e}")
            break

    def extract_chinese(txt):
        pattern = re.compile("[\u4e00-\u9fa5]+")
        return "".join(pattern.findall(txt))

    try:
        clean_chinese = extract_chinese(dataStr)
        crawlerList = list(jieba.cut(clean_chinese)) if clean_chinese else [keyword]
    except Exception as e:
        print(f"斷詞失敗: {e}")
        crawlerList = [keyword]

    _KEYWORD_WORDS_CACHE[keyword] = {"words": crawlerList, "timestamp": now}
    return crawlerList

@api_view(['GET'])
def nationList(request):
    crawlerList = crawlerKeyword(request)
    foreignQueryset = ForeignKeyword.objects.values_list("Name", flat=True)
    foreignList = set(foreignQueryset)
    commonWords = set(crawlerList) & foreignList

    if len(commonWords) > 3:
        nations = Nation.objects.all().order_by('-Nation_ID').values()
    else:
        nations = Nation.objects.all().order_by('Nation_ID').values()

    nationOptions = [{"value": nation["Nation_ID"], "label": nation["Name"]} for nation in nations]
    return Response(nationOptions)

@api_view(['GET'])
def categoryList(request):
    crawlerList = crawlerKeyword(request)
    nation_id = request.query_params.get('nation')
    industries = Industry.objects.filter(Nation_id=nation_id) if nation_id else Industry.objects.all()

    crawlerSet = set(crawlerList)
    data = []
    for industry in industries:
        industryWords = set(IndustryKeyword.objects.filter(Industry_id=industry.Industry_ID).values_list("Name", flat=True))
        commonWords = crawlerSet & industryWords
        data.append((len(commonWords), industry.Industry_ID, industry.Name))

    data.sort(key=lambda x: x[0], reverse=True)
    categories = [{"value": item[1], "label": item[2]} for item in data]
    return Response(categories)

def maPredict(df):
    future_days = 7
    if df.empty or 'Close' not in df.columns:
        return pd.DataFrame(columns=['Date', 'Forecast'])

    future_dates = pd.date_range(start=df.index[-1] + pd.Timedelta(days=1), periods=future_days, freq='D')
    close_series = df['Close'].copy()

    for date in future_dates:
        lookback = close_series[-14:] if len(close_series) >= 14 else close_series
        last_avg = float(lookback.mean()) if not lookback.empty else 0.0
        close_series = pd.concat([close_series, pd.Series([last_avg], index=[date])])

    future_df = pd.DataFrame({
        'Date': future_dates.strftime('%Y/%m/%d'),
        'Forecast': close_series[-future_days:].tolist()
    })
    return future_df

@api_view(['GET'])
def stockChart(request):
    time_param = request.query_params.get('time')
    predict = request.query_params.get('predict') == "true"
    category = request.query_params.get('category')

    if not category:
        return Response([], status=status.HTTP_200_OK)

    stocks = Stock.objects.filter(Industry_id=category)
    data = []

    period_str = "14d"
    if time_param:
        try:
            trackDay = datetime.datetime.strptime(time_param, '%Y/%m/%d')
            startDay = trackDay - datetime.timedelta(days=14)
            delta_days = max((datetime.datetime.today() - startDay).days, 14)
            period_str = f"{delta_days}d"
        except ValueError:
            period_str = "14d"

    for stock in stocks:
        try:
            df = yf.download(stock.Ticker, period=period_str, interval="1d", progress=False)
            if df.empty:
                continue

            # 處理 yfinance 可能返回 MultiIndex 欄位的情況
            if isinstance(df.columns, pd.MultiIndex):
                df = df.xs(stock.Ticker, level=1, axis=1) if stock.Ticker in df.columns.levels[1] else df.droplevel(1, axis=1)

            dfNew = df.reset_index()
            if 'Date' not in dfNew.columns or 'Close' not in dfNew.columns:
                continue

            date = dfNew['Date'].dt.strftime('%Y/%m/%d')
            close = dfNew['Close']

            if predict:
                df_future = maPredict(df)
                if not df_future.empty:
                    close = pd.concat([close, df_future['Forecast']], ignore_index=True)
                    date = pd.concat([date, df_future['Date']], ignore_index=True)

            data.append({
                "name": stock.Name,
                "date": date.tolist(),
                "close": [round(float(c), 2) for c in close.dropna()]
            })
        except Exception as e:
            print(f"獲取個股數據失敗 [{stock.Ticker}]: {e}")

    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def trackList(request):
    tracks = request.user.track_set.all().order_by('-Track_ID')
    serializer = TrackSerializer(tracks, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def timeList(request):
    times = Time.objects.all()
    serializer = TimeSerializer(times, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def trackDetail(request, pk):
    # 安全性修復：只能查看屬於該登入用戶的追蹤資訊
    track = get_object_or_404(Track, Track_ID=pk, User=request.user)
    serializer = TrackSerializer(track, many=False)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def trackCreate(request):
    data = request.data.copy()
    data["User"] = request.user.id

    industry_ids = data.get("Industries", [])
    if not industry_ids:
        return Response({'error': '請至少選擇一個產業類別'}, status=status.HTTP_400_BAD_REQUEST)

    industryList = []
    for i in industry_ids:
        try:
            industry = Industry.objects.get(Industry_ID=i)
            industryList.append({"Industry_ID": industry.Industry_ID, "Name": industry.Name})
        except Industry.DoesNotExist:
            continue

    if not industryList:
        return Response({'error': '所選產業不存在'}, status=status.HTTP_400_BAD_REQUEST)

    data["Industries"] = industryList

    # 取得最新交易日作為追蹤點
    trackDate = datetime.datetime.today().strftime('%Y/%m/%d')
    stock = Stock.objects.filter(Industry_id=industryList[0]["Industry_ID"]).first()
    if stock:
        try:
            df = yf.download(stock.Ticker, period="5d", progress=False)
            if not df.empty:
                df = df.reset_index()
                trackDate = df['Date'].iloc[-1].strftime('%Y/%m/%d')
        except Exception as e:
            print(f"取得標的最新日期失敗: {e}")

    time_obj, _ = Time.objects.get_or_create(Date=trackDate)
    data['Times'] = [{"Time_ID": time_obj.Time_ID, "Date": time_obj.Date}]

    serializer = TrackSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def trackTimeCreate(request, pk):
    # 安全性修復：只能打卡屬於自己的追蹤項目
    track = get_object_or_404(Track, Track_ID=pk, User=request.user)
    industry = track.Industries.first()

    trackDate = datetime.datetime.today().strftime('%Y/%m/%d')
    if industry:
        stock = Stock.objects.filter(Industry_id=industry.Industry_ID).first()
        if stock:
            try:
                df = yf.download(stock.Ticker, period="5d", progress=False)
                if not df.empty:
                    df = df.reset_index()
                    trackDate = df['Date'].iloc[-1].strftime('%Y/%m/%d')
            except Exception as e:
                print(f"取得最新日期失敗: {e}")

    time_obj, _ = Time.objects.get_or_create(Date=trackDate)

    if track.Times.filter(Date=trackDate).exists():
        msg = '您今日已進行追蹤！'
    else:
        track.Times.add(time_obj)
        msg = '追蹤成功！'

    serializer = TrackSerializer(track, many=False)
    serializer_data = serializer.data
    serializer_data['Message'] = msg
    return Response(serializer_data, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def trackDelete(request, pk):
    # 安全性修復：只能刪除屬於自己的追蹤項目
    track = get_object_or_404(Track, Track_ID=pk, User=request.user)
    track.delete()
    return Response({'Message': '刪除成功'}, status=status.HTTP_200_OK)
