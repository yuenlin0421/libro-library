import os
from celery import Celery

# 設定 Django 設定模組
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

app = Celery('core')

# 使用 Django 設定檔中以 CELERY_ 開頭的設定
app.config_from_object('django.conf:settings', namespace='CELERY')

# 自動發現所有已安裝應用程式中的 tasks
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')