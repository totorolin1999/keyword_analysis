from rest_framework import serializers
from .models import Track, Time, Industry

class IndustrySerializer(serializers.ModelSerializer):
    Industry_ID = serializers.IntegerField(required=False)
    class Meta:
        model = Industry
        fields = '__all__'

class TimeSerializer(serializers.ModelSerializer):
    Time_ID = serializers.IntegerField(required=False)
    class Meta:
        model = Time
        fields = '__all__'

class TrackSerializer(serializers.ModelSerializer):
    Industries = IndustrySerializer(many=True)
    Times = TimeSerializer(many=True)

    class Meta:
        model = Track
        fields = '__all__'

    def create(self, validated_data):
        industries_data = validated_data.pop('Industries')
        times_data = validated_data.pop('Times')
        track = Track.objects.create(**validated_data)

        industryIdList = []
        for industry_data in industries_data:
            industryIdList.append(industry_data["Industry_ID"])
        track.Industries.set(industryIdList)

        timeIdList = []
        for time_data in times_data:
            timeIdList.append(time_data["Time_ID"])
        track.Times.set(timeIdList)

        return track
        