from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import TrackSerializer, TimeSerializer, UserSerializer
from rest_framework import status
from .models import Industry, IndustryKeyword, Stock, Time, Track, Nation, ForeignKeyword
import re
import json
import requests
import pandas as pd
import datetime
import urllib.request as req
import jieba
import yfinance as yf
import time
# import pyodbc
# import numpy as np
# from sklearn.preprocessing import MinMaxScaler
# from keras.models import load_model
# from tensorflow.keras.layers import Dense, LSTM
# from tensorflow.keras.models import Sequential
# Create your views here.

@api_view(['POST'])
def register_user(request):
    if request.method == 'POST':
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        # ...

        return token


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

@api_view(['GET'])
def apiOverview(request):
    api_urls = {
        'Token': '/api/token',
        'Refresh': '/api/token/refresh',
        'keywordList': '/keyword-list/',
        'categoryList': '/category-list/',
    }
    return Response(api_urls)

@api_view(['GET'])
def keywordList(request):
    header = {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36"
    }
    # url="https://trends.google.com.tw/trends/api/dailytrends?hl=zh-TW&tz=-480&ed=20220926&geo=TW&ns=15"
    # resp = requests.get(url,headers=header)
    # resp.text

    # pd.DataFrame(json.loads(re.sub(r'\)\]\}\',\n', '', resp.text))['default']['trendingSearchesDays'][0]['trendingSearches'])

    enddt = datetime.datetime.today()
    startdt = enddt - datetime.timedelta(days=1)
    # enddt = datetime.datetime.today() - datetime.timedelta(days=1)
    # startdt = datetime.datetime.today()
    df = []
    for i in pd.date_range(start=datetime.datetime.strftime(startdt,'%Y%m%d'), end=datetime.datetime.strftime(enddt,'%Y%m%d'), freq='1D'):
        url = 'https://trends.google.com.tw/trends/api/dailytrends?hl=zh-TW&tz=-480&ed={}&geo=TW&ns=15'.format(datetime.datetime.strftime(i, '%Y%m%d'))
        print(url)
        resp = requests.get(url,headers=header)
        ndf=[]
        ndf = pd.DataFrame(json.loads(re.sub(r'\)\]\}\',\n', '', resp.text))['default']['trendingSearchesDays'][0]['trendingSearches'])
        ndf['date'] = datetime.datetime.strftime(i, '%Y-%m-%d')
        df.append(ndf)
    df = pd.concat(df, ignore_index=True)
    df['title'] = df['title'].apply(lambda x: x['query'])#讓title只顯示中文

    keywords = []
    for index, row in df.iterrows():
        keywords.append({"value": row['title'], "label": row['title']})

    return Response(keywords)

def crawlerKeyword(request):
    start = time.time()

    header = {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36"
    }
    # url="https://trends.google.com.tw/trends/api/dailytrends?hl=zh-TW&tz=-480&ed=20220926&geo=TW&ns=15"
    # resp = requests.get(url,headers=header)
    # resp.text

    # pd.DataFrame(json.loads(re.sub(r'\)\]\}\',\n', '', resp.text))['default']['trendingSearchesDays'][0]['trendingSearches'])

    enddt = datetime.datetime.today()
    startdt = enddt - datetime.timedelta(days=1)
    df = []
    for i in pd.date_range(start=datetime.datetime.strftime(startdt,'%Y%m%d'), end=datetime.datetime.strftime(enddt,'%Y%m%d'), freq='1D'):
        url = 'https://trends.google.com.tw/trends/api/dailytrends?hl=zh-TW&tz=-480&ed={}&geo=TW&ns=15'.format(datetime.datetime.strftime(i, '%Y%m%d'))
        print(url)
        resp = requests.get(url,headers=header)
        ndf=[]
        ndf = pd.DataFrame(json.loads(re.sub(r'\)\]\}\',\n', '', resp.text))['default']['trendingSearchesDays'][0]['trendingSearches'])
        ndf['date'] = datetime.datetime.strftime(i, '%Y-%m-%d')
        df.append(ndf)
    df = pd.concat(df, ignore_index=True)
    df['title'] = df['title'].apply(lambda x: x['query'])
    dataTitle = df['title'].head(40)
    dataArticles = df['articles'].head(40)
    print(dataTitle)
    # content = request.form['data']
    content = request.query_params.get('keyword')
    
    for i in range(40):
        if content == dataTitle[i]:
            dataStr = ""
            for j in range(3):
                try:
                    url = dataArticles[i][j]["url"]
                    data=req.Request(url,headers=header)
                    with req.urlopen(data) as response:
                            data=response.read().decode("utf-8")
                    print(url)
                    dataStr += data
                except:
                    print(f'無法爬取：{url}')
                # data=req.Request(url,headers=header)
                # with req.urlopen(data) as response:
                #         data=response.read().decode("utf-8")
                # dataStr += data
            # url = dataArticles[i][0]["url"]
            break
    end = time.time()
    print(format(end-start))
    # data=req.Request(url,headers=header)

    # with req.urlopen(data) as response:
    #     data=response.read().decode("utf-8")

    def extract_chinese(txt):
        pattern = re.compile("[\u4e00-\u9fa5]")
        return "".join(pattern.findall(txt))
    
    try:
        crawlerList = list(jieba.cut(extract_chinese(dataStr)))
    except:
        dataStr = ''
        crawlerList = list(jieba.cut(extract_chinese(dataStr)))
        print("發生錯誤！")

    return crawlerList

@api_view(['GET'])
def nationList(request):
    crawlerList = crawlerKeyword(request)
    foreignQueryset = ForeignKeyword.objects.values_list("Name", flat=True)
    foreignList = list(foreignQueryset)
    commonWords = set(crawlerList) & set(foreignList)
    if len(commonWords) > 4:
        nations = Nation.objects.all().order_by('-Nation_ID').values()
    else:
        nations = Nation.objects.all().order_by('Nation_ID').values()
    nationOptions = []
    for nation in nations:
        nationOptions.append({"value": nation["Nation_ID"], "label": nation["Name"]})
    return Response(nationOptions)

@api_view(['GET'])
def categoryList(request):
    crawlerList = crawlerKeyword(request)
    nation_id = request.query_params.get('nation')
    industries = Industry.objects.filter(Nation_id=nation_id)
    # industries = Industry.objects.all()
    data = []
    for industry in industries:
        industryQueryset = IndustryKeyword.objects.filter(Industry_id=industry.Industry_ID).values_list("Name", flat=True)
        industryList = list(industryQueryset)
        commonWords = set(crawlerList) & set(industryList)
        data.append((len(commonWords), industry.Industry_ID, industry.Name))
    data = sorted(data,key=lambda x: x[0], reverse = True)
    
    categories = []
    for i in data:
        categories.append({"value": i[1], "label": i[2]})
    
    return Response(categories)

# def lstmPredict(df):
#     # df = yf.download(stock.Ticker, period='1y') 配合load_model使用
#     y = df['Close'].fillna(method='ffill')
#     y = y.values.reshape(-1, 1)

#     scaler = MinMaxScaler(feature_range=(0, 1))
#     scaler = scaler.fit(y)
#     y = scaler.transform(y)

#     n_lookback = 1
#     n_forecast = 7

#     X = []
#     Y = []

#     for i in range(n_lookback, len(y) - n_forecast + 1):
#         X.append(y[i - n_lookback: i])
#         Y.append(y[i: i + n_forecast])

#     X = np.array(X)
#     Y = np.array(Y)

#     # model = load_model('stock_model/lstm_model.h5', compile = False)
#     # fit the model
#     model = Sequential()
#     model.add(LSTM(units=50, return_sequences=True, input_shape=(n_lookback, 1)))
#     model.add(LSTM(units=50))
#     model.add(Dense(n_forecast))

#     model.compile(loss='mean_squared_error', optimizer='adam')
#     model.fit(X, Y, epochs=100, batch_size=32, verbose=0)

#     X_ = y[- n_lookback:]
#     X_ = X_.reshape(1, n_lookback, 1)

#     Y_ = model.predict(X_).reshape(-1, 1)
#     Y_ = scaler.inverse_transform(Y_)

#     df_past = df[['Close']].reset_index()
#     df_past.rename(columns={'index': 'Date', 'Close': 'Actual'}, inplace=True)
#     df_past['Date'] = pd.to_datetime(df_past['Date'])

#     df_future = pd.DataFrame(columns=['Date', 'Forecast'])
#     df_future['Date'] = pd.date_range(start=df_past['Date'].iloc[-1] + pd.Timedelta(days=1), periods=n_forecast)
#     df_future['Forecast'] = Y_.flatten()
#     df_future['Date'] = df_future['Date'].dt.strftime('%Y/%m/%d')

#     return df_future

def maPredict(df):
    # 計算移動平均值
    # ma_period = 7  # 你可以根據需要調整這個參數
    # df['MA'] = df['Close'].rolling(window=ma_period).mean()

    # 預測未來七天的資料
    future_days = 7
    # last_ma_value = df['MA'].iloc[-1]
    # predicted_values = [last_ma_value] * future_days

    # 將預測值添加到DataFrame
    future_df = pd.DataFrame(columns=['Date', 'Forecast'])
    future_df['Date'] = pd.date_range(start=df.index[-1] + pd.Timedelta(days=1), periods=future_days, freq='D')
    # future_df['Forecast'] = predicted_values
    # future_df['Date'] = future_df['Date'].dt.strftime('%Y/%m/%d')

    # 使用迭代方式產生未來七天的預測值，以前三天的平均值為基準
    for date in future_df['Date']:
        last_three_days_avg = df['Close'][-7:].mean()
        # df = df.append(pd.DataFrame({'Close': last_three_days_avg}, index=[date]))
        df = pd.concat([df, pd.DataFrame({'Close': last_three_days_avg}, index=[date])])
    future_df['Forecast'] = df['Close'][-7:].tolist()
    future_df['Date'] = future_df['Date'].dt.strftime('%Y/%m/%d')

    # 將原始數據和預測數據合併
    # result_df = pd.concat([df, future_df])
    
    return future_df

@api_view(['GET'])
def stockChart(request):
    time = request.query_params.get('time')
    predict = request.query_params.get('predict')
    if time is not None:
        trackDay = datetime.datetime.strptime(time, '%Y/%m/%d')
        startDay = trackDay - datetime.timedelta(days=14)
        delta = datetime.datetime.today() - startDay
    # categories = request.query_params.get('categories[]')
    # categories = list(map(int, categories.split("|")))
    category = request.query_params.get('category')

    data = []
    # for category in categories:
    stocks = Stock.objects.filter(Industry_id=category)
    for stock in stocks:
        if time is None:
            df = yf.download(stock.Ticker, period="14d", interval="1d")
            dfNew = df.reset_index()
            date = dfNew['Date'].dt.strftime('%Y/%m/%d')
            close = dfNew['Close']

            if predict == "true":
                # df_future = lstmPredict(df)
                df_future = maPredict(df)
                close = pd.concat([close, df_future['Forecast']], ignore_index=True)
                date = pd.concat([date, df_future['Date']], ignore_index=True)
            data.append({"name": stock.Name, "date": date, "close": close})
        elif time is not None:
            df = yf.download(stock.Ticker, period=f"{delta.days}d", interval="1d")
            dfNew = df.reset_index()
            date = dfNew['Date'].dt.strftime('%Y/%m/%d')
            close = dfNew['Close']

            if predict == "true":
                # df_future = lstmPredict(df)
                df_future = maPredict(df)
                close = pd.concat([close, df_future['Forecast']], ignore_index=True)
                date = pd.concat([date, df_future['Date']], ignore_index=True)
            data.append({"name": stock.Name, "date": date, "close": close})
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def trackList(request):
    user = request.user
    tracks = user.track_set.all().order_by('-Track_ID')
    # tracks = Track.objects.all()
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
    tracks = Track.objects.get(Track_ID=pk)
    serializer = TrackSerializer(tracks, many=False)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def trackCreate(request):
    data = request.data
    data["User"] = request.user.id

    industryList = []
    for i in data["Industries"]:
        industry = Industry.objects.get(Industry_ID=i)
        industryList.append({"Industry_ID": industry.Industry_ID, "Name": industry.Name})
    data["Industries"] = industryList

    stock = Stock.objects.filter(Industry_id=industryList[0]["Industry_ID"]).first()
    df = yf.download(stock.Ticker, period="1d")
    df = df.reset_index()
    df['Date'] = df['Date'].dt.strftime('%Y/%m/%d')
    trackDate = df.at[0, "Date"]

    try:
        # time = Time.objects.filter(Date=trackDate).latest('Date')
        # print(time)
        time = Time.objects.get(Date=trackDate)
        data['Times']=[{"Time_ID": time.Time_ID, "Date": time.Date}]
    except:
        serializer = TimeSerializer(data={"Date": trackDate})
        if serializer.is_valid():
            serializer.save()

        time = Time.objects.get(Date=trackDate)
        data['Times']=[{"Time_ID": time.Time_ID, "Date": time.Date}]

    serializer = TrackSerializer(data=data)
    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def trackTimeCreate(request, pk):
    # tracks = Track.objects.get(Track_ID=pk)
    # serializer = TrackSerializer(tracks, many=False)

    tracks = Track.objects.get(Track_ID=pk)
    industry_id = tracks.Industries.first().Industry_ID
    stock = Stock.objects.filter(Industry_id=industry_id).first()
    df = yf.download(stock.Ticker, period="1d")
    df = df.reset_index()
    df['Date'] = df['Date'].dt.strftime('%Y/%m/%d')
    trackDate = df.at[0, "Date"]

    try:
        time = Time.objects.get(Date=trackDate)
    except:
        serializer = TimeSerializer(data={"Date": trackDate})
        if serializer.is_valid():
            serializer.save()
        
        time = Time.objects.get(Date=trackDate)

    try:
        tracks.Times.get(Date=trackDate)
        serializer = TrackSerializer(tracks, many=False)
        serializer_data = serializer.data
        additional_data = {'Message': '您今日已進行追蹤！'}
        serializer_data.update(additional_data)
    except:
        tracks.Times.add(time)
        serializer = TrackSerializer(tracks, many=False)
        serializer_data = serializer.data
        additional_data = {'Message': '追蹤成功！'}
        serializer_data.update(additional_data)
    
    return Response(serializer_data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def trackDelete(request, pk):
    track = Track.objects.get(Track_ID=pk)
    track.delete()

    return Response('刪除成功')