---
title: "Shoppy"
description: "Shoppy"
pubDate: 2025-05-20
---

https://app.hackthebox.com/machines/Shoppy

# Fase de reconocimiento

## Buscamos puertos abiertos

````
nmap -sS -p- -T5 --min-rate=5000 -vvv -Pn -n 10.10.11.180
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241209091623.png)

## Reconocimiento de servicios

````
nmap -sCV -p22,80,9093 10.10.11.180
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241209092230.png)

## Gobuster

````
gobuster dir -u http://shoppy.htb -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 20
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241209100558.png)
Buscar subdominios

````
gobuster vhost -u http://shoppy.htb -w /usr/share/seclists/Discovery/DNS/bitquark-subdomains-top100000.txt -t 200
````

mattermost.shoppy.htb

# Fase de ataque

## NoSQL injection

Se puede intentar realizar una consulta NOSQL

* Para sacar información se puede hacer un error
  ![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241209105336.png)
* Bypass the login diciendo que la pass no es (No funciona en este caso)
  ![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241209105556.png)
* MongoDB payload

````
' || '1'=='1
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241209105830.png)
Login!

## NoSQL injection search

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241209111023.png)
Encontramos passwords hasheadas en md5
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241209111100.png)
Crackeamos las passwords
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241209111348.png)

## Login en subdominio

Reutilizamos la password de josh

Information leakage
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241209113245.png)

Iniciamos sesion por ssh con las credenciales encontradas
\[-\] ==pwned!==

# Privilege Escalation

````
sudo -l
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241209113707.png)
De password-manager miramos las strings

````
strings -e l password-manager
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241209114242.png)
También se puede utilizar ghydra

Ejecutamos como deploy y usamos la contraseña encontrada
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241209114348.png)

Nos conectamos como deploy
Este usuario esta en el grupo docker
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241209115420.png)

Creamos un contenedor docker donde montamos toda la raiz en /mnt del contenedor

Transformamos los privilegios del bash en contenedor para convertirlo en SUID
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241209120333.png)
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241209120422.png)
\[+\] ==pwned!==
