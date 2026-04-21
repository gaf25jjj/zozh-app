import os
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WEB_DIR = os.path.join(BASE_DIR, 'web')

app = FastAPI(title='ZdorovLife Mini App')
app.mount('/assets', StaticFiles(directory=WEB_DIR), name='assets')


@app.get('/')
def root():
    return FileResponse(os.path.join(WEB_DIR, 'index.html'))
