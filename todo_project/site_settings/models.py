from django.db import models
from django.core.exceptions import ValidationError

class SiteSettings(models.Model):
    whatsapp_number = models.CharField(max_length=20, help_text="Enter your WhatsApp number with the country code, e.g., +905XXXXXXXXX")
    google_maps_embed_url = models.TextField(blank=True, help_text="Enter the Google Maps embed URL for your location.")

    def __str__(self):
        return "Site Settings"

    def save(self, *args, **kwargs):
        if not self.pk and SiteSettings.objects.exists():
            # This will prevent creating a new instance if one already exists.
            raise ValidationError('There can be only one SiteSettings instance')
        return super(SiteSettings, self).save(*args, **kwargs)

    class Meta:
        verbose_name = "Site Settings"
        verbose_name_plural = "Site Settings"
