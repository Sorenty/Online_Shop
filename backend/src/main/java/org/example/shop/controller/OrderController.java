package org.example.shop.controller;

import org.example.shop.model.Order;
import org.example.shop.model.OrderItem;
import org.example.shop.model.Product;
import org.example.shop.repository.OrderRepository;
import org.example.shop.repository.ProductRepository;
import org.example.shop.service.UserDetailsImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orderRepo;
    private final ProductRepository productRepo;

    public OrderController(OrderRepository orderRepo, ProductRepository productRepo) {
        this.orderRepo = orderRepo;
        this.productRepo = productRepo;
    }

    @PostMapping
    public ResponseEntity<?> placeOrder(@RequestBody List<OrderItem> items,
                                        @AuthenticationPrincipal UserDetailsImpl user) {
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        try {
            for (OrderItem it : items) {
                Product p = productRepo.findById(it.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found: " + it.getProductId()));
                if (p.getStock() < it.getQuantity()) {
                    return ResponseEntity.badRequest().body("Not enough stock for product " + p.getId());
                }
                p.setStock(p.getStock() - it.getQuantity());
                productRepo.save(p);

                it.setProductName(p.getName());
                it.setPrice(p.getPrice());
            }

            Order order = new Order(user.getId(), items);
            Order saved = orderRepo.save(order);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @GetMapping
    public List<Order> all() {
        return orderRepo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOne(@PathVariable Long id) {
        return orderRepo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
}
