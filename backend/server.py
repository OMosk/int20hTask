import json

import tornado.web
import tornado.ioloop
import tornado.websocket
import psycopg2

import api


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        db = self.application.db
        messages = db.chat.find()
        self.render('index.html', messages=messages)


class WebSocket(tornado.websocket.WebSocketHandler):
    def check_origin(self, origin):
        return True

    def open(self):
        self.application.webSocketsPool.append(self)

    def on_message(self, message):
        db = self.application.db
        message_dict = json.loads(message)
        if message_dict["type"] == "register":
            response = api.register(message_dict)
            
        else:
            response = "sorry"
        self.write_message(response)

        # db.chat.insert(message_dict)
        # for key, value in enumerate(self.application.webSocketsPool):
        #     if value != self:
        #         value.ws_connection.write_message(message)


    def on_close(self, message=None):
        for key, value in enumerate(self.application.webSocketsPool):
            if value == self:
                del self.application.webSocketsPool[key]

class Application(tornado.web.Application):
    def __init__(self):
        self.webSocketsPool = []

        settings = {
            'static_url_prefix': '/static/',
        }
        conn = psycopg2.connect("dbname='chat' user='dbuser' host='localhost' password='dbpass'")
        self.db = conn.cursor()
        handlers = (
            (r'/', MainHandler),
            (r'/api?', WebSocket),
        )

        tornado.web.Application.__init__(self, handlers)

application = Application()


if __name__ == '__main__':
    application.listen(8000)
    tornado.ioloop.IOLoop.instance().start()
