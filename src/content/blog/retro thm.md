---
title: "retro thm"
description: "retro thm"
pubDate: 2025-05-20
---

https://tryhackme.com/r/room/retro

# Fase de reconocimiento

## Buscar puertos abiertos

````
nmap -sS -p- -T5 --min-rate=5000 -vvv -Pn -n 10.10.175.77
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240912194102.png)

## Reconocimiento de servicios

````
nmap -sVC -p80,3389 -Pn 10.10.175.77
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240912194154.png)

## Gobuster

````
gobuster dir -u http://10.10.175.77 -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 30
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240912194352.png)
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240912194535.png)

## Reconocimiento Web

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240912195111.png)

# Fase de ataque

El wordpress login no es accesible

## Login 3389 RDP

Nos logueamos con el usuario wade, quien escribe la nota en la web

Instalamos el cliente RDP Remmina y nos conectamos con las credenciales (wade:parzival)
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240912211515.png)
\[-\] ==pwned!==

# Privilege Escalation

## Usando la CVE-2019-1388

Ejecutamos el EXE como administrador
Y desde el certificado lo abrimos con el navegador y ejecutamos cmd desde el buscador
(No me funcionó)

## Usando la [CVE-2017-0213](https://github.com/SecWiki/windows-kernel-exploits/blob/master/CVE-2017-0213/CVE-2017-0213_x64.zip)

Funciona para la build 14393
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240912213121.png)
Abrimos un server HTTP para compartir el exe
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240912213454.png)
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240912213549.png)
Ejecutas el exe
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240912213638.png)
\[+\] ==pwned!
