import readline from 'readline'
import process from 'process'

type verifiedIpAddress = any

interface VerificationStrategy {
	verify(data: string): boolean | Object
}

// Subsistema de autenticación
// Subsistema de autenticación
class Authentication {
	public authenticate(username: string, password: string): boolean {
		// Implementación de la autenticación
		// Aquí puedes realizar la lógica de autenticación, por ejemplo, consultar una base de datos o comparar con credenciales predefinidas
		return username === 'admin' && password === 'admin123'
	}
}

// Estrategia de validación de datos
class DataValidationStrategy implements VerificationStrategy {
	public verify(data: string): boolean {
		// Implementación de la validación de datos
		// Aquí puedes realizar la lógica de validación de datos, por ejemplo, verificar si el formato es correcto o si ciertos campos son obligatorios
		return data.length > 0
	}
}

// Estrategia de filtrado de direcciones IP
class IPFilterStrategy implements VerificationStrategy {
	private failedRequests: Record<string, number> = {}

	public verify(ipAddress: string): boolean | Object {
		// Implementación del filtrado de direcciones IP
		// Aquí puedes realizar la lógica de filtrado de direcciones IP, por ejemplo, contar los intentos fallidos de una misma IP y bloquearla después de cierto número de intentos
		const failedAttempts = this.failedRequests[ipAddress] || 0
		console.log(this.failedRequests)
		if (failedAttempts >= 3) {
			console.log(`La dirección IP ${ipAddress} ha sido bloqueada.`)
			return { state: false, ip: ipAddress }
		}

		// Realizar otras verificaciones...

		// Incrementar el número de intentos fallidos de la dirección IP
		this.failedRequests[ipAddress] = failedAttempts + 1

		return true
	}
}

// Estrategia de caché
class CacheStrategy implements VerificationStrategy {
	private cachedResponses: Record<string, boolean> = {}

	public verify(data: string): boolean {
		// Implementación de la verificación de respuesta en caché
		// Aquí puedes realizar la lógica de verificación de respuesta en caché, por ejemplo, verificar si hay una respuesta previamente almacenada para los datos proporcionados
		const cachedResponse = this.cachedResponses[data]
		if (cachedResponse) {
			console.log('Respuesta encontrada en caché.')
			return true
		}

		// Realizar otras verificaciones...

		// Guardar la respuesta en caché para los datos proporcionados
		this.cachedResponses[data] = true

		return true
	}
}

// Facade
class OrderSystemFacade {
	private authentication: Authentication
	private verificationStrategies: VerificationStrategy[]
	private verificationIp: VerificationStrategy = new IPFilterStrategy()

	constructor() {
		this.authentication = new Authentication()
		this.verificationStrategies = [new DataValidationStrategy(), new CacheStrategy()]
	}

	public placeOrder(
		username: string = '',
		password: string = '',
		requestData: string,
		ipAddress: string
	): boolean | Object {
		const verifiedIpAddress: verifiedIpAddress = this.verificationIp.verify(ipAddress)
		if (typeof verifiedIpAddress === 'object' && !verifiedIpAddress.state) {
			return { state: false, reason: 'ip' }
		}

		const authenticated = this.authentication.authenticate(username, password)
		if (!authenticated) {
			return false
		}

		for (const strategy of this.verificationStrategies) {
			const verified = strategy.verify(requestData)
			if (!verified) {
				return false
			}
		}

		// Procesamiento adicional para realizar la orden en línea
		return true
	}
}

// Función para leer la entrada del usuario desde la consola
function prompt(question: string): Promise<string> {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	})

	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			rl.close()
			resolve(answer)
		})
	})
}

// Ejemplo de uso
async function login(OrderSystemFacade: any) {
	const facade = OrderSystemFacade

	let authenticated: any

	while (true) {
		const username = await prompt('Ingrese su nombre de usuario: ')
		const password = await prompt('Ingrese su contraseña: ')

		username && password && console.log('Verificando credenciales...')

		if (!username || !password) {
			console.log('No ingresaste credenciales. Inténtelo nuevamente.')
			continue
		}
		authenticated = facade.placeOrder(username, password, 'requestData', 'ipAddress')

		if (
			typeof authenticated === 'object' &&
			!authenticated.state &&
			authenticated.reason === 'ip'
		) {
			console.log('La dirección IP ha sido bloqueada. Inténtelo nuevamente más tarde.')
			break
		}

		if (!authenticated) {
			console.log('Credenciales incorrectas. Inténtelo nuevamente.')
		} else {
			break
		}
	}

	if (typeof authenticated !== 'object' && authenticated) {
		console.log('Inicio de sesión exitoso.')
	} else {
		console.log('Número máximo de intentos alcanzado. Por favor, intente más tarde.')
	}
}

function menu(facade: any) {
	console.log()
	console.log('Bienvenido al sistema de pedidos en línea.')
	console.log()
	prompt('Seleccione una opción:\n1. Login\n2. Salir\n').then((option) => {
		console.clear()
		switch (option) {
			case '1':
				login(facade)
					.then(() => {
						menu(facade)
					})
					.catch((error) => {
						console.log('Error:', error)
						menu(facade)
					})
				break
			case '2':
				break
			default:
				console.log('Opción inválida. Inténtelo nuevamente.')
				menu(facade)
		}
	})
}

const facade = new OrderSystemFacade()
menu(facade)
