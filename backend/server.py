import json

import tornado.web
import tornado.ioloop
import tornado.websocket
import psycopg2
import psycopg2.extras

import router


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
        if 'actions' not in message_dict.keys():
            self.write_message("no actions in message")
            return
        response_actions = []
        for action in message_dict["actions"]:

            response_action = {'actionId': action['actionId'],
                               'type': action['type'],
                               }
            if action["type"] == "registration":
                response = router.register(action, db)

            if action["type"] == "auth":
                response = router.auth(action, db)
                
            else:
                response_action['message'] = "sorry"
            response_action.update(response)
            response_actions.append(response_action)
        response = {'actions': response_actions}
        response = json.dumps(response)
        self.write_message(response)


    def on_close(self, message=None):
        conn = self.application.conn
        conn.commit()
        for key, value in enumerate(self.application.webSocketsPool):
            if value == self:
                del self.application.webSocketsPool[key]

class Application(tornado.web.Application):
    def __init__(self):
        self.webSocketsPool = []

        settings = {
            'static_url_prefix': '/static/',
        }
        self.conn = psycopg2.connect("dbname='chat' user='dbuser' host='localhost' password='dbpass'")
        self.db = self.conn.cursor(cursor_factory = psycopg2.extras.DictCursor)
        handlers = (
            (r'/', MainHandler),
            (r'/api?', WebSocket),
        )

        tornado.web.Application.__init__(self, handlers)

application = Application()


if __name__ == '__main__':
    application.listen(8000)
    tornado.ioloop.IOLoop.instance().start()
