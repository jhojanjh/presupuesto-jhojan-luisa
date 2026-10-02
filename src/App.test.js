import { render, screen } from '@testing-library/react';
import App from './App';

afterEach(() => {
  jest.restoreAllMocks();
});

test('muestra el presupuesto cargado del servidor', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ({ gastos: [], aportes: [] })
  });

  render(<App />);

  expect(
    await screen.findByText('Control de Presupuesto Compartido')
  ).toBeInTheDocument();
});

test('no guarda datos vacíos en el servidor si la carga falló', async () => {
  const fetchMock = jest
    .spyOn(global, 'fetch')
    .mockRejectedValue(new Error('Servidor caído'));

  render(<App />);

  expect(
    await screen.findByText(/No se pudieron cargar los datos del servidor/)
  ).toBeInTheDocument();

  await new Promise((resolve) => setTimeout(resolve, 2500));

  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock).not.toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({ method: 'PUT' })
  );
});
