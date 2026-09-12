from django.contrib import admin
from .models import Category, Ticket, TicketComment, Device
# Register your models here.

admin.site.register(Category)
admin.site.register(Ticket)
admin.site.register(TicketComment)
admin.site.register(Device)
