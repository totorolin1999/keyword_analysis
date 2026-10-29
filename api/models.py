from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Nation(models.Model):
    Nation_ID = models.AutoField(primary_key=True)
    Name = models.CharField(max_length=255)

    def __str__(self):
        return self.Name
    
class ForeignKeyword(models.Model):
    FK_ID = models.AutoField(primary_key=True)
    Name = models.CharField(max_length=255)

    def __str__(self):
        return self.Name

class Industry(models.Model):
    Industry_ID = models.AutoField(primary_key=True)
    Nation = models.ForeignKey(Nation, null=True, on_delete=models.SET_NULL)
    Name = models.CharField(max_length=255)

    def __str__(self):
        return self.Name
    
class IndustryKeyword(models.Model):
    IK_ID = models.AutoField(primary_key=True)
    Industry = models.ForeignKey(Industry, null=True, on_delete=models.SET_NULL)
    Name = models.CharField(max_length=255)

    def __str__(self):
        return self.Name
    
class Stock(models.Model):
    Stock_ID = models.AutoField(primary_key=True)
    Industry = models.ForeignKey(Industry, null=True, on_delete=models.SET_NULL)
    Nation = models.ForeignKey(Nation, null=True, on_delete=models.SET_NULL)
    Name = models.CharField(max_length=255)
    Ticker = models.CharField(max_length=255)

    def __str__(self):
        return self.Name
    
class Time(models.Model):
    Time_ID = models.AutoField(primary_key=True)
    Date = models.CharField(max_length=15, unique=True)

    def __str__(self):
        return self.Date
    
class Track(models.Model):
    Track_ID = models.AutoField(primary_key=True)
    Keyword = models.CharField(max_length=255)
    User = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    Industries = models.ManyToManyField(Industry, blank=True)
    Times = models.ManyToManyField(Time, blank=True)

    def __str__(self):
        return self.Keyword
