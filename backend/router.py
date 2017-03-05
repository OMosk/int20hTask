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
    if success:
        response_action["name"] = user["name"]
        response_action["photo"] = user["photo"]
        response_action['provider_id'] = user['provider_id']
    else:
        response_action["error"] = "no such user"
    return response_action


def create_group(action, db):
    response_action = {}
    e, success = api.create_group(action, db)
    if success:
        response_action["success"] = True
        response_action["group_id"] = e
    else:
        response_action["error"] = str(e)
    return response_action


def add_to_group(action, db):
    response_action = {}
    e, success = api.add_user_to_group(action, db)
    if success:
        response_action["success"] = True
    else:
        response_action["error"] = str(e)
    return response_action


def get_all_users(db):
    response_action = {}
    raw_users, success = api.get_all_users(db)
    if success:
        users = []
        for i in raw_users:
            user = {
                "id": i['provider_id'],
                "name": i["name"],
                "photo": i["photo"],
                "geo_location": i["geo_location"]
            }
            users.append(user)
        response_action["users"] = users
    else:
        response_action["error"] = "couldn't get users list"
    return response_action


def get_all_groups(action, db):
    response_action = {}
    groups, success = api.get_all_groups(action, db)
    if success:
        response_action['groups'] = groups
    else:
        response_action['error'] = str(groups)
    return response_action


def sent_message(socket, action, db):
    api.add_message_to_db(action, db)
    for sock in socket.application.webSocketsPool:
        if api.user_in_group(sock.id, action['group_id'], db):
            sock.write_message(action)


def invite_into_group(socket, action, db):
    params = {"group_id": action['group_id'],
              "user_id": action["guest_id"]}
    api.add_user_to_group(params, db)
    action['guest'] = api.get_user(action["guest_id"], db)
    for sock in socket.application.webSocketsPool:
        if sock.id == action['guest_id']:
            group = api.get_all_groups(action, db, group_id=action['group_id'])[0]
            action['group'] = group
            actions = {"actions": [action, ]}
            sock.write_message(actions)
        elif api.user_in_group(sock.id, action['group_id'], db):
            actions = {"actions": [action, ]}
            sock.write_message(actions)


def delete_from_group(socket, action, db):
    response_action = {}
    e, success = api.delete_user_from_group(action, db)
    if success:
        for sock in socket.application.webSocketsPool:
            if api.user_in_group(sock.id, action['group_id'], db):
                sock.write_message(action)
    else:
        response_action['error'] = str(e)
        return response_action


def set_goal(socket, action, db):
    api.set_goal(action, db)
    for sock in socket.application.webSocketsPool:
            if api.user_in_group(sock.id, action['group_id'], db):
                sock.write_message(action)


def update_location(action, db):
    response_action = {}
    e, success = api.update_location(action, db)
    if not success:
        response_action['error'] = str(e)
    else:
        response_action = action
    return response_action
