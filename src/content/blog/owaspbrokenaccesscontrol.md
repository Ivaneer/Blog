---
title: "owaspbrokenaccesscontrol"
description: "owaspbrokenaccesscontrol"
pubDate: 2025-05-20
---

https://tryhackme.com/r/room/owaspbrokenaccesscontrol

# Fase de reconocimiento

## Buscamos puertos abiertos

````
nmap -sS -p- -T5 --min-rate=5000 -vvv -Pn -n 10.10.40.180
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240501175827.png)

## Reconocimiento de servicios

````
nmap -sVC -p22,80,443,3306 -Pn 10.10.40.180
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240501175950.png)

## Gobuster

````
gobuster dir -u http://10.10.40.180 -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 20 -x .php
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240501181016.png)

# Fase de ataque

## Enumeración

1. Creamos una cuenta
1. Vemos como se llama la cuenta del admin
   ![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240501180452.png)
1. Entramos a /admin.php y nos damos permisos
   ![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240501181113.png)

Finish!
