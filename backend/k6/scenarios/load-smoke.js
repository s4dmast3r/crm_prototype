import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  vus: 5,
  duration: '15s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
  },
}

const baseUrl = __ENV.BASE_URL || 'http://localhost:3000'

export default function () {
  const health = http.get(`${baseUrl}/health`)
  const ready = http.get(`${baseUrl}/ready`)
  const info = http.get(`${baseUrl}/api/v1/system/info`)

  check(health, {
    'health responds 200': (response) => response.status === 200,
  })
  check(ready, {
    'ready responds 200': (response) => response.status === 200,
  })
  check(info, {
    'system info responds 200': (response) => response.status === 200,
  })

  sleep(1)
}
