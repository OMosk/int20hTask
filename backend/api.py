import uuid
import datetime


def register(action, db):
    try:
        action['providerId'] = action["provider"] + action['providerUserId']
        user = get_user_by_id(action['providerId'], db)
        if user:
            return user[0]["auth_tocken"], True
        action['auth_tocken'] = str(uuid.uuid4())
        sql = '''INSERT INTO users
            (provider_id, name, photo, geo_location, auth_tocken)
            VALUES(%(providerId)s, %(name)s, %(photo)s, %(geoLocation)s, %(auth_tocken)s)
        '''
        db.execute(sql, action)
        return action['auth_tocken'], True
    except Exception as e:
        print e
        return e, False


def get_user_by_id(id, db):
    sql = 'SELECT * FROM users WHERE provider_id = %s'
    db.execute(sql, [str(id), ])
    return db.fetchall()


def auth(action, db):
    sql = 'SELECT * FROM users WHERE auth_tocken = %s'
    db.execute(sql, [action['token']])
    user = db.fetchone()
    return user, True if user else False


def create_group(action, db):
    try:
        sql = '''INSERT INTO groups
                (name, group_user)
                VALUES(%(name)s, %(user_id)s)
            '''
        values = {"name": action["name"],
                  "user_id": action["user_id"]}
        db.execute(sql, values)
        group = get_group(action, db)
        values['group_id'] = group
        add_user_to_group(values, db)
        return values['group_id'], True
    except Exception as e:
        print e
        return e, False


def get_group(action, db):
    sql = """
        SELECT id from groups
        WHERE name = %(name)s
        AND group_user = %(user_id)s
    """
    db.execute(sql, action)
    group_id = db.fetchall()[0]
    return group_id[0]


def add_user_to_group(action, db):
    sql = "SELECT * FROM group_users WHERE group_id = %(group_id)s AND user_id = %(user_id)s"
    db.execute(sql, action)
    exists = db.fetchall()
    if exists:
        return "user already exists", False
    else:
        try:
            sql = """INSERT INTO group_users (group_id, user_id)
                VALUES (%(group_id)s, %(user_id)s)"""
            db.execute(sql, action)
            return values, True
        except Exception as e:
            print e
            return e, False


def get_all_users(db):
    try:
        db.execute("Select * from users")
        users = db.fetchall()
        return users, True
    except Exception as e:
        print e
        return e, False

def get_all_groups(action, db):
    try:
        sql = """SELECT gr.name, gu.group_id
            from groups gr LEFT OUTER JOIN group_users gu
            ON gr.id = gu.group_id
            WHERE gu.user_id = %(user_id)s
            """
        db.execute(sql, action)
        raw_groups = db.fetchall()
        groups = []
        for raw_group in raw_groups:
            group = {"name": raw_group['name'],
                     "group_id": raw_group["group_id"]}
            sql = """SELECT users.* from
                users LEFT OUTER JOIN group_users gu
                ON users.provider_id = gu.user_id
                WHERE gu.group_id = %s
            """
            db.execute(sql, [group["group_id"]])
            raw_users = db.fetchall()
            users = []
            for i in raw_users:
                user = {
                    "id": i['provider_id'],
                    "name": i["name"],
                    "photo": i["photo"],
                    "geo_location": i["geo_location"]
                }
                user["message"] = get_bubble(group['group_id'], user['id'], db)
                users.append(user)
            group["users"] = users
            groups.append(group)
        return groups, True
    except Exception as e:
        print e
        return e, False


def add_message_to_db(action, db):
    sql = """
        INSERT INTO bubbles (text, authour, group_id, date)
        VALUES (%(text)s, %(user_id)s, %(group_id)s, %(date)s)
    """
    action['date'] = datetime.datetime.now()
    db.execute(sql, action)
    action['date'] = str(action['date'])


def user_in_group(user_id, group_id, db):
    sql = """
        SELECT * FROM group_users
        WHERE user_id = %(user_id)s
        AND group_id = %(group_id)s
    """
    values = {"user_id": user_id, "group_id": group_id}
    db.execute(sql, values)
    users = db.fetchall()
    return True if users else False


def get_bubble(group_id, user_id, db):
    sql = """SELECT text from bubbles
        WHERE authour = %(user_id)s
        AND group_id = %(group_id)s
        ORDER  BY date DESC
    """
    values = {"user_id": user_id, "group_id": group_id}
    db.execute(sql, values)
    bubbles = db.fetchall()
    if bubbles:
        bubbles = bubbles[0]
    return bubbles


def update_location(action, db):
    try:
        sql = """
            UPDATE users SET geo_location = %(geoLocation)s
            WHERE provider_id = %(user_id)s
        """
        db.execute(sql, action)
        return None, True
    except Exception as e:
        print e
        return e, False


def delete_user_from_group(action, db):
    try:
        sql = """
            DELETE FROM group_users
            WHERE group_id = %(group_id)s
            AND user_id = %(user_id)s
        """
        db.execute(sql, action)
        return None, True
    except Exception as e:
        print e
        return e, False
