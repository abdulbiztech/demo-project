import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../product.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-product',
  templateUrl: './order-product.component.html',
  styleUrls: ['./order-product.component.css'],
})
export class OrderProductComponent implements OnInit {
  orderForm!: FormGroup;
  products: any[] = [];
  totalQuantity: number = 0;
  totalValue: number = 0;
  invoiceAmount: number = 0;
  userName = 'ParkExcel'; // Displayed username

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router
  ) {
    this.orderForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(40),
        ],
      ],
      date: ['', [Validators.required]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{6,10}$')]],
      email: ['', [Validators.required, Validators.email]],
      discount: [0, [Validators.min(0)]],
      products: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.productService.getProducts().subscribe((data: any) => {
      this.products = data;
      this.addProduct();
    });
  }

  get productFormArray() {
    return this.orderForm.get('products') as FormArray;
  }

  addProduct() {
    this.productFormArray.push(
      this.fb.group({
        id: ['', Validators.required],
        code: [{ value: '', disabled: true }],
        rate: [{ value: 0, disabled: true }],
        quantity: [1, [Validators.required, Validators.min(1)]],
        value: [{ value: 0, disabled: true }],
      })
    );
  }

  removeProduct(index: number) {
    if (this.productFormArray.length > 1) {
      this.productFormArray.removeAt(index);
      this.calculateTotals();
    }
  }

  onProductIdChange(index: number) {
    const productGroup = this.productFormArray.at(index);
    const productId = productGroup.get('id')?.value;
    const product = this.products.find((p) => p.id === productId);

    if (product) {
      productGroup.get('code')?.setValue(product.code);
      productGroup.get('rate')?.setValue(product.price);
      this.calculateProductValue(index);
    } else {
      alert('Invalid Product Id');
      productGroup.get('id')?.setValue('');
    }
  }

  calculateProductValue(index: number) {
    const productGroup = this.productFormArray.at(index);
    const rate = productGroup.get('rate')?.value || 0;
    const quantity = productGroup.get('quantity')?.value || 0;
    const value = rate * quantity;
    productGroup.get('value')?.setValue(value);
    this.calculateTotals();
  }

  calculateTotals() {
    this.totalQuantity = this.productFormArray.controls.reduce(
      (acc, group) => acc + (group.get('quantity')?.value || 0),
      0
    );
    this.totalValue = this.productFormArray.controls.reduce(
      (acc, group) => acc + (group.get('value')?.value || 0),
      0
    );
    this.invoiceAmount =
      this.totalValue - (this.orderForm.get('discount')?.value || 0);
  }

  onSubmit() {
    if (
      this.orderForm.valid &&
      this.totalQuantity > 0 &&
      this.invoiceAmount > 0
    ) {
      alert('Order Submitted');
      console.log(this.orderForm.value);
      this.displayOrderSummary();
    } else {
      alert('Invalid order details');
    }
  }

  displayOrderSummary() {
    const orderSummary = {
      Name: this.orderForm.get('name')?.value,
      Date: this.orderForm.get('date')?.value,
      Mobile: this.orderForm.get('mobile')?.value,
      Email: this.orderForm.get('email')?.value,
      TotalQuantity: this.totalQuantity,
      TotalValue: this.totalValue,
      Discount: this.orderForm.get('discount')?.value,
      InvoiceAmount: this.invoiceAmount,
      Products: this.productFormArray.value.map((product: any) => ({
        Id: product.id,
        Code: product.code,
        Rate: product.rate,
        Quantity: product.quantity,
        Value: product.value,
      })),
    };
    console.log('Order Summary:', orderSummary);
  }

  onCancel() {
    this.orderForm.reset();
    this.productFormArray.clear();
    this.addProduct();
    this.calculateTotals();
  }

  logout() {
    alert('You have been logged out.');
    this.router.navigate(['/login']);
  }
}
