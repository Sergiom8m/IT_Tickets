import firebase_admin
from firebase_admin import credentials, firestore, auth
import pandas as pd
import secrets
import string
import uuid

cred = credentials.Certificate("priv.json")
firebase_admin.initialize_app(cred)

# Inicializar Firestore
db = firestore.client()

# Función para generar una contraseña aleatoria
def generar_password(longitud=10):
    caracteres = string.ascii_letters + string.digits
    password = ''.join(secrets.choice(caracteres) for i in range(longitud))
    return password

# Cargar el archivo users.csv
archivo_xlsx = 'users.csv'  
df = pd.read_csv(archivo_xlsx)

# Quitar la columna titulación
df = df.drop(columns=['TITULACIÓN'])

# Iterar sobre las filas del dataframe (usuarios)
for index, row in df.iterrows():

    uid = str(uuid.uuid4())
    psw = generar_password()

    try:
        # Añadir en Firestore
        user_data = {   
            'name': row['NOMBRE'],
            'email': row['CORREO'],
            'department': row['DEPARTAMENTO'],
            'password': psw,
            'role': 'user',
            'uid': uid, 
            'code': row['CÓDIGO']
        }

        user = auth.create_user(
                uid=uid,
                email=row['CORREO'],
                password=psw
            )
    except Exception as e:
        print(f"Error creando el usuario {row['CORREO']}: {e}")

    db.collection('Usuarios').document(uid).set(user_data)
