from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import TrackSerializer, TimeSerializer

from .models import Industry, IndustryKeyword, CrawlerKeyword, Stock, Time, Track

import re
import json
import requests
import pandas as pd
from bs4 import BeautifulSoup
import datetime

import urllib.request as req
import jieba
import yfinance as yf

import time
import pyodbc

import numpy as np
from sklearn.preprocessing import MinMaxScaler
from keras.models import load_model
from tensorflow.keras.layers import Dense, LSTM
from tensorflow.keras.models import Sequential
# Create your views here.

@api_view(['GET'])
def apiOverview(request):
    api_urls = {
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

@api_view(['GET'])
def categoryList(request):
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
    start = time.time()
    # data=req.Request(url,headers=header)

    # with req.urlopen(data) as response:
    #     data=response.read().decode("utf-8")

    def extract_chinese(txt):
        pattern = re.compile("[\u4e00-\u9fa5]")
        return "".join(pattern.findall(txt))
    
    try:
        list_2 = list(jieba.cut(extract_chinese(dataStr)))
    except:
        dataStr = ''
        list_2 = list(jieba.cut(extract_chinese(dataStr)))
        print("發生錯誤！")
    
    conn = pyodbc.connect(
        Trusted_Connection='Yes',
        Driver='{ODBC Driver 17 for SQL Server}',
        Server='localhost\SQLEXPRESS',
        Database='keyworddb'
    )
    cursor = conn.cursor()
    cursor.execute('''TRUNCATE TABLE keyworddb.dbo.api_crawlerkeyword''')
    for i in list_2:
        cursor.execute('''INSERT INTO keyworddb.dbo.api_crawlerkeyword (Name) VALUES (?)''',i)
    conn.commit()

    industries = Industry.objects.all()
    data = []
    for industry in industries:
        queryset1 = CrawlerKeyword.objects.values_list("Name", flat=True)
        queryset2 = IndustryKeyword.objects.filter(Industry_id=industry.Industry_ID).values_list("Name", flat=True)
        intersection_qs = queryset1.intersection(queryset2)
        data.append((intersection_qs.count(), industry.Industry_ID, industry.Name))
    data = sorted(data,key=lambda x: x[0], reverse = True)
    
    categories = []
    for i in data:
        categories.append({"value": i[1], "label": i[2]})

    end = time.time()
    print(format(end-start))
    
    return Response(categories)

@api_view(['GET'])
def stockChart(request):
    time = request.query_params.get('time')
    predict = request.query_params.get('predict')
    if time is not None:
        trackDay = datetime.datetime.strptime(time, '%Y/%m/%d')
        startDay = trackDay - datetime.timedelta(days=14)
        delta = datetime.datetime.today() - startDay
    categories = request.query_params.get('categories[]')
    categories = list(map(int, categories.split("|")))

    data = []
    for category in categories:
        stocks = Stock.objects.filter(Industry_id=category)
        for stock in stocks:
            if time is None:
                df = yf.download(stock.Ticker, period="14d", interval="1d")
                dfNew = df.reset_index()
                date = dfNew['Date'].dt.strftime('%Y/%m/%d')
                close = dfNew['Close']

                if predict == "true":
                    # df = yf.download(stock.Ticker, period='1y')
                    y = df['Close'].fillna(method='ffill')
                    y = y.values.reshape(-1, 1)

                    scaler = MinMaxScaler(feature_range=(0, 1))
                    scaler = scaler.fit(y)
                    y = scaler.transform(y)

                    n_lookback = 1
                    n_forecast = 7

                    X = []
                    Y = []

                    for i in range(n_lookback, len(y) - n_forecast + 1):
                        X.append(y[i - n_lookback: i])
                        Y.append(y[i: i + n_forecast])

                    X = np.array(X)
                    Y = np.array(Y)

                    # model = load_model('stock_model/lstm_model.h5', compile = False)
                    # fit the model
                    model = Sequential()
                    model.add(LSTM(units=50, return_sequences=True, input_shape=(n_lookback, 1)))
                    model.add(LSTM(units=50))
                    model.add(Dense(n_forecast))

                    model.compile(loss='mean_squared_error', optimizer='adam')
                    model.fit(X, Y, epochs=100, batch_size=32, verbose=0)

                    X_ = y[- n_lookback:]
                    X_ = X_.reshape(1, n_lookback, 1)

                    Y_ = model.predict(X_).reshape(-1, 1)
                    Y_ = scaler.inverse_transform(Y_)

                    df_past = df[['Close']].reset_index()
                    df_past.rename(columns={'index': 'Date', 'Close': 'Actual'}, inplace=True)
                    df_past['Date'] = pd.to_datetime(df_past['Date'])

                    df_future = pd.DataFrame(columns=['Date', 'Forecast'])
                    df_future['Date'] = pd.date_range(start=df_past['Date'].iloc[-1] + pd.Timedelta(days=1), periods=n_forecast)
                    df_future['Forecast'] = Y_.flatten()
                    df_future['Date'] = df_future['Date'].dt.strftime('%Y/%m/%d')
                    close = pd.concat([close, df_future['Forecast']], ignore_index=True)
                    date = pd.concat([date, df_future['Date']], ignore_index=True)
                data.append({"name": stock.Name, "date": date, "close": close})
            elif time is not None:
                df = yf.download(stock.Ticker, period=f"{delta.days}d", interval="1d")
                dfNew = df.reset_index()
                date = dfNew['Date'].dt.strftime('%Y/%m/%d')
                close = dfNew['Close']

                if predict == "true":
                    # df = yf.download(stock.Ticker, period='1y')
                    y = df['Close'].fillna(method='ffill')
                    y = y.values.reshape(-1, 1)

                    scaler = MinMaxScaler(feature_range=(0, 1))
                    scaler = scaler.fit(y)
                    y = scaler.transform(y)

                    n_lookback = 1
                    n_forecast = 7

                    X = []
                    Y = []

                    for i in range(n_lookback, len(y) - n_forecast + 1):
                        X.append(y[i - n_lookback: i])
                        Y.append(y[i: i + n_forecast])

                    X = np.array(X)
                    Y = np.array(Y)

                    # model = load_model('stock_model/lstm_model.h5', compile = False)
                    # fit the model
                    model = Sequential()
                    model.add(LSTM(units=50, return_sequences=True, input_shape=(n_lookback, 1)))
                    model.add(LSTM(units=50))
                    model.add(Dense(n_forecast))

                    model.compile(loss='mean_squared_error', optimizer='adam')
                    model.fit(X, Y, epochs=100, batch_size=32, verbose=0)

                    X_ = y[- n_lookback:]
                    X_ = X_.reshape(1, n_lookback, 1)

                    Y_ = model.predict(X_).reshape(-1, 1)
                    Y_ = scaler.inverse_transform(Y_)

                    df_past = df[['Close']].reset_index()
                    df_past.rename(columns={'index': 'Date', 'Close': 'Actual'}, inplace=True)
                    df_past['Date'] = pd.to_datetime(df_past['Date'])

                    df_future = pd.DataFrame(columns=['Date', 'Forecast'])
                    df_future['Date'] = pd.date_range(start=df_past['Date'].iloc[-1] + pd.Timedelta(days=1), periods=n_forecast)
                    df_future['Forecast'] = Y_.flatten()
                    df_future['Date'] = df_future['Date'].dt.strftime('%Y/%m/%d')
                    close = pd.concat([close, df_future['Forecast']], ignore_index=True)
                    date = pd.concat([date, df_future['Date']], ignore_index=True)
                data.append({"name": stock.Name, "date": date, "close": close})
    return Response(data)

@api_view(['GET'])
def trackList(request):
    tracks = Track.objects.all()
    serializer = TrackSerializer(tracks, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def timeList(request):
    times = Time.objects.all()
    serializer = TimeSerializer(times, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def trackDetail(request, pk):
    tracks = Track.objects.get(Track_ID=pk)
    serializer = TrackSerializer(tracks, many=False)
    return Response(serializer.data)

@api_view(['POST'])
def trackCreate(request):
    data = request.data

    industryList = []
    for i in data["Industries"]:
        industry = Industry.objects.get(Industry_ID=i)
        industryList.append({"Industry_ID": industry.Industry_ID, "Name": industry.Name})
    data["Industries"] = industryList

    df = yf.download("2330.TW", period="1d")
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
def trackTimeCreate(request, pk):
    # tracks = Track.objects.get(Track_ID=pk)
    # serializer = TrackSerializer(tracks, many=False)

    df = yf.download("2330.TW", period="1d")
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

    tracks = Track.objects.get(Track_ID=pk)
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
def trackDelete(request, pk):
    track = Track.objects.get(Track_ID=pk)
    track.delete()

    return Response('刪除成功')