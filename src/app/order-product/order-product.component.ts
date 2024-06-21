import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ProductService } from "../product.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-order-product",
  templateUrl: "./order-product.component.html",
  styleUrls: ["./order-product.component.css"],
})
export class OrderProductComponent implements OnInit {
  orderForm!: FormGroup;
  products: any[] = [];
  totalQuantity: number = 0;
  totalValue: number = 0;
  invoiceAmount: number = 0;
  userName = "ParkExcel"; // Displayed username

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router
  ) {
    this.orderForm = this.fb.group({
      name: [
        "",
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(40),
        ],
      ],
      date: ["", [Validators.required]],
      mobile: ["", [Validators.required, Validators.pattern("^[0-9]{6,10}$")]],
      email: ["", [Validators.required, Validators.email]],
      discount: [0, [Validators.min(0)]],
      products: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.productService.getProducts().subscribe((data: any) => {
      if (Array.isArray(data.data)) {
        this.products = data.data;
        this.addProduct();
      } else {
        console.error("Unexpected data format from ProductService");
      }
    });
  }

  get productFormArray() {
    return this.orderForm.get("products") as FormArray;
  }

  addProduct() {
    this.productFormArray.push(
      this.fb.group({
        id: ["", Validators.required],
        code: [{ value: "", disabled: true }],
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
    const productId = productGroup.get("id")?.value;

    if (productId) {
      this.productService.getProduct(productId).subscribe(
        (product) => {
          if (product) {
            productGroup.get("code")?.setValue(product.code);
            productGroup.get("rate")?.setValue(product.price);
            this.calculateProductValue(index);
          } else {
            console.error("Product not found for ID:", productId);
            alert("Invalid Product Id");
            productGroup.get("id")?.setValue("");
          }
        },
        (error) => {
          console.error("Error fetching product:", error);
          alert("Error fetching product details.");
        }
      );
    }
  }

  calculateProductValue(index: number) {
    const productGroup = this.productFormArray.at(index);
    const rate = productGroup.get("rate")?.value || 0;
    const quantity = productGroup.get("quantity")?.value || 0;
    const value = rate * quantity;
    productGroup.get("value")?.setValue(value);
    this.calculateTotals();
  }

  calculateTotals() {
    this.totalQuantity = 0;
    this.totalValue = 0;
    this.productFormArray.controls.forEach((group) => {
      this.totalQuantity += group.get("quantity")?.value || 0;
      this.totalValue += group.get("value")?.value || 0;
    });

    const discount = this.orderForm.get("discount")?.value || 0;
    this.invoiceAmount = this.totalValue - discount;
  }

  onSubmit() {
    if (this.orderForm.valid) {
      console.log("Order submitted", this.orderForm.value);
    } else {
      console.log("Form is invalid");
    }
  }

  onLogout() {
    this.router.navigate(["/login"]);
  }

  onCancel() {
    this.orderForm.reset();
    while (this.productFormArray.length) {
      this.productFormArray.removeAt(0);
    }
    this.addProduct();
  }
}
