import uuid

def register(action, db):
    try:
        action['providerId'] = action["provider"] + action['providerUserId']
        user = get_user_by_id(action['providerId'], db)
        if user:
            return "such user already exists", False
        action['auth_tocken'] = str(uuid.uuid4())
        sql = '''INSERT INTO users
            (provider_id, name, photo, geo_location, auth_tocken)
            VALUES(%(providerId)s, %(name)s, %(photo)s, %(geoLocation)s, %(auth_tocken)s)
        '''
        db.execute(sql, action)
        return action['auth_tocken'], True
    except Exception as e:
        print e
        return "some problems while registration", False


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
    user = get_user_by_id(action["user_id"], db)
    if not user:
        print "NO SUCH USER"
    try:
        sql = '''INSERT INTO groups
                (name, group_user)
                VALUES(%(name)s, %(group_user)s)
            '''
        values = {"name": action["name"],
                  "group_user": action["user_id"]}
        db.execute(sql, values)
        return True
    except Exception as e:
        print e
        return False


def get_all_users(db):
    try:
        db.execute("Select * from users")
        return db.fetchall(), True
    except Exception as e:
        print e
        return "couldn't get users", False
