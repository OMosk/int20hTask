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