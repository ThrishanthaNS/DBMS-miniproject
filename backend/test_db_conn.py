import os
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import Error
import sys

# Load env
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

config = {
    'host': os.getenv('DB_HOST','localhost'),
    'port': int(os.getenv('DB_PORT',3306)),
    'user': os.getenv('DB_USER','root'),
    'password': os.getenv('DB_PASSWORD',''),
    'database': os.getenv('DB_NAME','prism')
}
print('Using config:', {k: (v if k!='password' else '***') for k,v in config.items()})
try:
    conn = mysql.connector.connect(**config)
    print('Connection OK, server version:', conn.get_server_info())
    conn.close()
    sys.exit(0)
except Error as e:
    print('Connection failed:', e)
    sys.exit(2)
