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
        conn = self.application.conn
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
                conn.commit()
                if 'error' not in response.keys():
                    self.id = action["provider"] + action['providerUserId']
            elif action["type"] == "auth":
                response = router.auth(action, db)
                if 'error' not in response.keys():
                    self.id = response['provider_id']
            elif action["type"] == "create_group":
                response = router.create_group(action, db)
                conn.commit()
            elif action["type"] == "get_all_users":
                response = router.get_all_users(db)
            elif action["type"] == "add_to_group":
                response = router.add_to_group(action, db)
                conn.commit()
            elif action["type"] == "get_all_groups":
                response = router.get_all_groups(action, db)
            elif action['type'] == 'sent_message':
                response = router.sent_message(self, action, db)
                continue
            elif action['type'] == 'invite_into_group':
                response = router.invite_into_group(self, action, db)
                continue
            elif action['type'] == 'delete_from_group':
                response = router.delete_from_group(self, action, db)
                continue
            elif action['type'] == 'set_goal':
                response = router.set_goal(self, action, db)
                continue
            elif action['type'] == 'update_location':
                response = router.update_location(action, db)

            else:
                response['error'] = "sorry, no such action"
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
        self.db = self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        handlers = (
            (r'/', MainHandler),
            (r'/api?', WebSocket),
        )

        tornado.web.Application.__init__(self, handlers)

application = Application()


if __name__ == '__main__':
    application.listen(8000)
    tornado.ioloop.IOLoop.instance().start()
