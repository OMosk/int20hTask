import uuid


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
                VALUES(%(name)s, %(group_user)s)
            '''
        values = {"name": action["name"],
                  "group_user": action["user_id"]}
        db.execute(sql, values)
        group = get_group(action, db)
        action['group_id'] = group
        add_user_to_group(action, db)
        return None, True
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
            return None, True
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
                users.append(user)
            group["users"] = users
            groups.append(group)
        return groups, True
    except Exception as e:
        print e
        return e, False

