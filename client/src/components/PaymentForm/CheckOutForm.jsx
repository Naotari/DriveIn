import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useDispatch, useSelector } from "react-redux";
import swal from "sweetalert";
import image from "../../images/stripe.png";
import { getPayment } from "../../redux/actions/actions";
import cancel from "../../images/cancelacion.PNG";

export default function CheckOutForm() {
  const vehiclesDetail = useSelector((state) => state.details);
  const dispatch = useDispatch();
  const [date, setDate] = useState({});
  const [extras, setExtras] = useState({
    seguro: 50,
    bebe: 0,
    niño: 0,
    porta: 0,
  });
  const [seguro, bebe, niño, porta] = [50, 10, 10, 20];
  const user = JSON.parse(localStorage.getItem("UserLogin"));
  const stripe = useStripe();
  const elements = useElements();

  const handleChange = (e) => {
    e.preventDefault();
    setDate({
      ...date,
      [e.target.name]: e.target.value,
    });
  };

  const disableDates = () => {
    let today, dd, mm, yyyy;
    today = new Date();
    dd = today.getDate() + 1;
    mm = today.getMonth() + 1;
    yyyy = today.getFullYear();
    return yyyy + "-" + mm + "-" + dd;
  };

  const maxDesde = () => {
    let dato = date.Hasta.split("-");
    let today = dato && new Date(dato[0], dato[1], dato[2]);
    let dd = today.getDate() - 1;
    let mm = today.getMonth();
    let yyyy = today.getFullYear();
    return yyyy + "-" + mm + "-" + dd;
  };

  const minHasta = () => {
    let dato = date.Desde.split("-");
    let today = dato && new Date(dato[0], dato[1], dato[2]);
    let dd = today.getDate() + 1;
    let mm = today.getMonth();
    let yyyy = today.getFullYear();
    return yyyy + "-" + mm + "-" + dd;
  };

  const diffDays = (from, to) => {
    if (!from || !to) {
      return "Miss info";
    } else {
      const fechaInicio = new Date(from).getTime();
      const fechaFin = new Date(to).getTime();
      const diff = fechaFin - fechaInicio;
      const days = diff / (1000 * 60 * 60 * 24);
      return days;
    }
  };

  const handleExtras = (dias) => {
    const price =
      extras.seguro +
      extras.bebe * dias +
      extras.niño * dias +
      extras.porta * dias;
    return price;
  };

  const handleExtraChange = (e) => {
    e.preventDefault();
    if (e.target.checked) {
      setExtras({
        ...extras,
        [e.target.name]: e.target.value,
      });
    } else {
      setExtras({
        ...extras,
        [e.target.name]: 0,
      });
    }
  };

  const handlePrice = () => {
    const dias = diffDays(date.Desde, date.Hasta);
    let finalPrice = handleExtras(dias) + vehiclesDetail.initialPrice * dias;
    return finalPrice;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement),
    });
    if (!error) {
      const price = handlePrice();
      const { id } = paymentMethod;
      const payload = {
        id,
        amount: price * 100,
        brand: vehiclesDetail.brand,
        model: vehiclesDetail.model,
        category: vehiclesDetail.category,
        vehicleId: vehiclesDetail.id,
        user: user,
        dateInit: date.Desde,
        dateFinish: date.Hasta,
      };
      const response = dispatch(getPayment(payload));
      swal({
        title: "Procesando pago",
        text: "Aguarde unos segundos, por favor",
        buttons: false,
        timer: 10000,
      });
      elements.getElement(CardElement).clear();
    }
  };

  return (
    <>
      <div>
        <div className="h-[90px] m-auto bg-white mt-[10px] flex flex-row justify-around mb-4">
          <div className="w-[50px] h-[50px] m-auto">
            <img src={cancel} alt="img-cancelacion" className="w-full h-full" />
          </div>
          <div className="flex flex-col w-11/12 mt-2">
            <span className="text-start text-[#2E3A46] text-lg font-bold">
              Cancelacion gratuita
            </span>
            <p className="text-[#2E3A46] text-base text-start tracking-wide font-medium">
              Asegúrate este precio hoy. Puedes cancelar sin cargo hasta 6 horas
              antes de la entrega para obtener un reembolso del 100%.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 mt-2 m-auto w-8/12">
          <p className="p-2 bg-[#2E3A46] text-white font-bold">
            Accesorios adicionales
          </p>
          <div className="block">
            <div className="mt-2 flex flex-start">
              <label className="inline-flex items-start">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded focus:ring-2 focus:ring-blue-500 "
                  checked
                  disabled
                  value={seguro}
                />

                <span className="mx-2">Seguro (obligatorio)</span>
                <span className="text-xs text-red-600 text-end">
                  50 USD total
                </span>
              </label>
            </div>
          </div>
          <div className="block">
            <div className="mt-2 flex flex-start">
              <label className="inline-flex items-start">
                <input
                  name="bebe"
                  type="checkbox"
                  className="w-5 h-5 rounded"
                  value={bebe}
                  onChange={handleExtraChange}
                />
                <span className="mx-2">Butaca para bebe</span>
                <span className="text-xs text-red-600">10 USD / dia</span>
              </label>
            </div>
          </div>
          <div className="block">
            <div className="mt-2 flex flex-start">
              <label className="inline-flex items-start">
                <input
                  name="niño"
                  type="checkbox"
                  className="w-5 h-5 rounded"
                  value={niño}
                  onChange={handleExtraChange}
                />
                <span className="mx-2">Butaca para niño</span>
                <span className="text-xs text-red-600">10 USD / dia</span>
              </label>
            </div>
          </div>
          <div className="block">
            <div className="mt-2 flex flex-start">
              <label className="inline-flex items-start">
                <input
                  name="porta"
                  type="checkbox"
                  className="w-5 h-5 rounded"
                  value={porta}
                  onChange={handleExtraChange}
                />
                <span className="mx-2">Portaequipaje</span>
                <span className="text-xs text-red-600">20 USD / dia</span>
              </label>
            </div>
          </div>
        </div>

        <h1 className="mt-4">Seleccione la fecha</h1>
        <div className="flex mt-2 justify-center space-x-4">
          <div className="block">
            <label className="relative text-black text-sm">Desde</label>
            <input
              min={disableDates()}
              onChange={handleChange}
              max={date.Hasta && maxDesde()}
              type="date"
              name="Desde"
              className="flex w-50  h-10  bg-[#2E3A46] text-white  rounded-xl py-2 pl-3 pr-3 text-left shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm"
            />
          </div>
          <div className="block">
            <label className="relative text-black text-sm">Hasta</label>
            <input
              min={date.Desde && minHasta()}
              onChange={handleChange}
              type="date"
              name="Hasta"
              disabled={date.Desde ? false : true}
              className="flex w-50  h-10  bg-[#2E3A46] text-white  rounded-xl py-2 pl-3 pr-3 text-left shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm"
            />
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          className="w-[400px] rounded-lg p-3 m-auto mt-2 bg-slate-100 ring-2 ring-[#2E3A46]"
        >
          <p>
            Precio Final:{" "}
            {isNaN(handlePrice()) ? null : ` ${handlePrice()} USD`}
          </p>
          <br></br>
          <div className=" p-3 ring-2 rounded">
            <CardElement />
          </div>
          <br></br>
          <button
            type="submit"
            className="bg-[#2E3A46] text-white  rounded py-2 px-3 hover:bg-green"
          >
            Pagar
          </button>
        </form>

        <img src={image} alt="stripe" className="m-auto" />
        <p className="text-xs">
          mas informacion en{" "}
          <a
            href="https://www.stripe.com/"
            target="_blank"
            className="text-blue"
          >
            Stripe.com
          </a>
        </p>
      </div>
    </>
  );
}
