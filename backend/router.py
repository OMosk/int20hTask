import api


def register(action, db):
    response_action = {}
    value, success = api.register(action, db)
    if success:
        response_action['token'] = value
    else:
        response_action['error'] = value
    return response_action


def auth(action, db):
    response_action = {}
    user, success = api.auth(action, db)
    print type(user)
    if success:
        response_action["name"] = user["name"]
        response_action["photo"] = user["photo"]
    else:
        response_action["error"] = "no such user"
    return response_action


def create_group(action, db):
    response_action = {}
    success = api.create_group(action, db)
    if success:
        response_action["success"] = True
    else:
        response_action["error"] = "couldn't create group"
    return response_action


def get_all_users(db):
    response_action = {}
    users, success = api.get_all_users(db)
    if success:
        response_action["users"] = users
    else:
        response_action["error"] = "couldn't get users list"
    return response_action
