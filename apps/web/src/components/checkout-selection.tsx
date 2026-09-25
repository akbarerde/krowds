"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@krowds/ui/components/badge";
import { Button } from "@krowds/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@krowds/ui/components/card";
import { Input } from "@krowds/ui/components/input";
import type { EventFixture, PaymentMethod, TicketProductFixture } from "@/lib/fixtures";
import { formatDateRange, formatIdr } from "@/lib/format";

const paymentMethods: Array<{ value: PaymentMethod; label: string; detail: string }> = [
  {
    value: "qris",
    label: "QRIS",
    detail: "Scan with an approved Indonesian payment app.",
  },
  {
    value: "virtual_account",
    label: "Virtual account",
    detail: "Follow the provider instruction to transfer IDR.",
  },
  {
    value: "approved_ewallet",
    label: "Approved e-wallet",
    detail: "Continue through the provider-hosted payment step.",
  },
];

function TicketOption({
  product,
  selected,
  onSelect,
}: {
  product: TicketProductFixture;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
        selected ? "border-primary bg-muted" : "border-border hover:bg-muted/60"
      }`}
    >
      <input
        type="radio"
        name="ticketProduct"
        value={product.id}
        checked={selected}
        onChange={onSelect}
        className="mt-1 size-4 accent-primary"
      />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-medium">{product.name}</span>
          <span className="font-semibold tabular-nums">{formatIdr(product.amountIdr)}</span>
        </span>
        <span className="mt-1 block text-sm leading-5 text-muted-foreground">
          {product.description}
        </span>
        <span className="mt-2 block text-xs font-medium text-muted-foreground">
          {product.remainingLabel}
        </span>
      </span>
    </label>
  );
}

export function CheckoutSelection({ event }: { event: EventFixture }) {
  const router = useRouter();
  const [selectedProductId, setSelectedProductId] = useState(event.ticketProducts[0].id);
  const [quantity, setQuantity] = useState(1);
  const [method, setMethod] = useState<PaymentMethod>("qris");
  const selectedProduct =
    event.ticketProducts.find((product) => product.id === selectedProductId) ?? event.ticketProducts[0];
  const totalIdr = (BigInt(selectedProduct.amountIdr) * BigInt(quantity)).toString();

  function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    router.push(`/checkout/status?order=${encodeURIComponent(event.checkoutOrderId)}`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <Card>
        <CardHeader className="gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Checkout entry</Badge>
            <Badge variant="outline">Preview only</Badge>
          </div>
          <CardTitle className="text-2xl tracking-[-0.02em]">
            <h1 className="m-0">Choose your ticket</h1>
          </CardTitle>
          <CardDescription className="max-w-2xl leading-6">
            Review the event details below. This preview collects browser UI state only; it does not
            create an order, charge a card, or decide that a payment succeeded.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
            <fieldset className="flex flex-col gap-3">
              <legend className="text-base font-semibold">Ticket type</legend>
              <p className="text-sm leading-6 text-muted-foreground">
                Choose one available product for this event.
              </p>
              <div className="grid gap-3">
                {event.ticketProducts.map((product) => (
                  <TicketOption
                    key={product.id}
                    product={product}
                    selected={product.id === selectedProduct.id}
                    onSelect={() => setSelectedProductId(product.id)}
                  />
                ))}
              </div>
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="quantity" className="text-sm font-medium">
                  Quantity
                </label>
                <select
                  id="quantity"
                  name="quantity"
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <option key={value} value={value}>
                      {value} {value === 1 ? "ticket" : "tickets"}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">The MVP limit is 10 tickets per order.</p>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="holder-name" className="text-sm font-medium">
                  Ticket holder name
                </label>
                <Input
                  id="holder-name"
                  name="holderName"
                  autoComplete="name"
                  placeholder="e.g. Ayu Pratama"
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">
                  Identity validation and holder rules belong to the backend contract.
                </p>
              </div>
            </div>

            <fieldset className="flex flex-col gap-3">
              <legend className="text-base font-semibold">Payment method</legend>
              <p className="text-sm leading-6 text-muted-foreground">
                KROWDS supports IDR payments through approved Xendit instructions. Cards are not
                collected here.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {paymentMethods.map((paymentMethod) => (
                  <label
                    key={paymentMethod.value}
                    className={`flex cursor-pointer flex-col gap-1 rounded-xl border p-4 text-sm transition-colors ${
                      method === paymentMethod.value
                        ? "border-primary bg-muted"
                        : "border-border hover:bg-muted/60"
                    }`}
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={paymentMethod.value}
                        checked={method === paymentMethod.value}
                        onChange={() => setMethod(paymentMethod.value)}
                        className="size-4 accent-primary"
                      />
                      {paymentMethod.label}
                    </span>
                    <span className="text-xs leading-5 text-muted-foreground">
                      {paymentMethod.detail}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-sm leading-6 text-muted-foreground">
                Continue to the payment status preview. A production flow will call the Go-owned
                order and payment endpoints.
              </p>
              <Button type="submit" size="lg" className="w-full sm:w-auto">
                Continue to payment status
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="lg:sticky lg:top-24">
        <CardHeader className="gap-2">
          <CardTitle className="text-lg">Order summary</CardTitle>
          <CardDescription>{event.title}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 text-sm">
            <dt className="text-muted-foreground">When</dt>
            <dd>{formatDateRange(event.startsAt, event.endsAt)}</dd>
            <dt className="text-muted-foreground">Where</dt>
            <dd>
              {event.venue.name}
              <br />
              {event.venue.city}
            </dd>
            <dt className="text-muted-foreground">Product</dt>
            <dd>{selectedProduct.name}</dd>
            <dt className="text-muted-foreground">Quantity</dt>
            <dd className="tabular-nums">{quantity}</dd>
            <dt className="text-muted-foreground">Method</dt>
            <dd>{paymentMethods.find((item) => item.value === method)?.label}</dd>
          </dl>
          <div className="flex items-center justify-between border-t pt-4">
            <span className="font-medium">Total</span>
            <span className="text-xl font-semibold tabular-nums">{formatIdr(totalIdr)}</span>
          </div>
          <p aria-live="polite" className="rounded-lg bg-muted p-3 text-xs leading-5 text-muted-foreground">
            Selected locally: {quantity} × {selectedProduct.name}. Nothing has been submitted.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
