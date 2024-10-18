import firebase_admin
from firebase_admin import credentials, auth

# Inicializar Firebase Admin SDK
cred = credentials.Certificate('priv.json')  # Cambia por la ruta a tu archivo
firebase_admin.initialize_app(cred)

# Función para listar y borrar todos los usuarios en lotes
def eliminar_todos_los_usuarios():
    try:
        # Obtener todos los usuarios de Firebase Authentication en lotes de 1000
        users = auth.list_users().users
        uids = [user.uid for user in users]

        while uids:
            # Borrar usuarios por lotes de hasta 1000 UIDs
            delete_result = auth.delete_users(uids)
            print(f"{delete_result.success_count} usuarios eliminados exitosamente.")
            print(f"{delete_result.failure_count} fallos.")

            # Listar los siguientes usuarios
            users = auth.list_users().users
            uids = [user.uid for user in users]

    except Exception as e:
        print(f"Error eliminando usuarios: {e}")

# Ejecutar la función para eliminar todos los usuarios
eliminar_todos_los_usuarios()
