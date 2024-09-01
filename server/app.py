import os

from robyn import Robyn

from server.pkg.api.v1.routes import api

app = Robyn(__file__)
app.include_router(api)


@app.get("/")
def index():
    return "Hello World!"


if __name__ == "__main__":
    app.start(host="0.0.0.0", port=int(os.getenv("PORT", 8080)))
