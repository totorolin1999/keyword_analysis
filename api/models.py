from django.db import models

# Create your models here.

class Industry(models.Model):
    Industry_ID = models.AutoField(primary_key=True)
    Name = models.CharField(max_length=255)

    def __str__(self):
        return self.Name
    
class IndustryKeyword(models.Model):
    IK_ID = models.AutoField(primary_key=True)
    Industry = models.ForeignKey(Industry, null=True, on_delete=models.SET_NULL)
    Name = models.CharField(max_length=255)

    def __str__(self):
        return self.Name
    
class CrawlerKeyword(models.Model):
    CK_ID = models.AutoField(primary_key=True)
    Name = models.CharField(max_length=255)

    def __str__(self):
        return self.Name
    
class Stock(models.Model):
    Stock_ID = models.AutoField(primary_key=True)
    Industry = models.ForeignKey(Industry, null=True, on_delete=models.SET_NULL)
    Name = models.CharField(max_length=255)
    Ticker = models.CharField(max_length=255)

    def __str__(self):
        return self.Name
    
class Time(models.Model):
    Time_ID = models.AutoField(primary_key=True)
    Date = models.CharField(max_length=15)

    def __str__(self):
        return self.Date
    
class Track(models.Model):
    Track_ID = models.AutoField(primary_key=True)
    Keyword = models.CharField(max_length=255)
    Industries = models.ManyToManyField(Industry, blank=True, null=True)
    Times = models.ManyToManyField(Time, blank=True, null=True)

    def __str__(self):
        return self.Keyword